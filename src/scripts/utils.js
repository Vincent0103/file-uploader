import { body } from "express-validator";
import multer from "multer";
import { filesize } from "filesize";
import { format } from "date-fns";
import mime from "mime-types";
import prettyMilliseconds from "pretty-ms";
import db from "../db/queries.js";
import storageClient from "./storageClient.js";

const validationErrorMessages = (() => {
  const lengthErr = (min, max) => `must be between ${min} and ${max}.`;
  const alphanumericErr =
    "must only contain letters, numbers or one of these characters (_-).";
  const lowerCaseErr = "have atleast one lowercase letter (a-z)";
  const upperCaseErr = "have atleast one uppercase letter (A-Z)";
  const digitErr = "have atleast one digit (0-9)";
  const specialCharErr = "have atleast one special character (@$!%*?&)";
  const matchErr = "do not match.";

  return {
    lengthErr,
    alphanumericErr,
    lowerCaseErr,
    upperCaseErr,
    digitErr,
    specialCharErr,
    matchErr,
  };
})();

const validateEntity = (name, attributeName, messageName) => [
  body(attributeName)
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage(`${messageName} ${validationErrorMessages.lengthErr(1, 255)}`)
    .custom(async (value, { req }) => {
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const entityExists = await db.doesEntityExistsInFolder(
        value,
        parentFolderId,
      );

      if (entityExists) {
        throw new Error(`${name} "${value}" already exists.`);
      }

      return true;
    }),
];

const getNodesFromEntityId = async (entityId) => {
  const nodes = [];

  let currentEntityId = entityId;
  do {
    const folder = await db.getEntityById(currentEntityId);
    if (!folder) break;

    nodes.push({
      name: folder.name,
      folderId: folder.id,
    });
    currentEntityId = folder.predecessorId;
  } while (currentEntityId);

  nodes.reverse();
  return nodes;
};

const getPathFromEntityId = async (entityId) => {
  const nodes = await getNodesFromEntityId(entityId);
  const folders = nodes.map(({ name }) => name);
  const path = folders.join("/");

  return path;
};

const getFilenameWithExtension = (filename, extension) =>
  mime.lookup(filename) ? filename : `${filename}.${extension}`;

const storageHandler = (() => {
  const getMulterOptions = () => {
    const storage = multer.memoryStorage();
    const limits = {
      fileSize: 1024 * 1024 * 10, // 10MB
      files: 1,
    };

    return { storage, limits };
  };

  // the filename should include the extension with it (ex: image0.png -> .png)
  const uploadFile = async (filePath, fileBody, filename, extension) => {
    const filenameWithExtension = getFilenameWithExtension(filename, extension);

    const { error } = await storageClient
      .from("user_uploads")
      .upload(`${filePath}/${filenameWithExtension}`, fileBody);

    if (error) {
      throw new Error(
        `Error uploading file ${filePath}/${filenameWithExtension}: ${error.message}`,
      );
    }
  };

  const updateFile = async (filePath, filename, newFilename, extension) => {
    const filenameWithExtension = getFilenameWithExtension(filename, extension);
    const newFilenameWithExtension = getFilenameWithExtension(
      newFilename,
      extension,
    );

    const { error } = await storageClient
      .from("user_uploads")
      .move(
        `${filePath}/${filenameWithExtension}`,
        `${filePath}/${newFilenameWithExtension}`,
      );

    if (error) {
      throw new Error(
        `Error moving file ${filePath}/${filenameWithExtension} to ${filePath}/${filenameWithExtension}: ${error.message}`,
      );
    }
  };

  const deleteFile = async (filePath, filename, extension) => {
    const filenameWithExtension = getFilenameWithExtension(filename, extension);
    const { error } = await storageClient
      .from("user_uploads")
      .remove([`${filePath}/${filenameWithExtension}`]);

    if (error) {
      throw new Error(
        `Error deleting file ${filePath}/${filenameWithExtension}: ${error.message}`,
      );
    }
  };

  const getStoragePath = (filePath, filename, extension) => {
    const filenameWithExtension = getFilenameWithExtension(filename, extension);
    const { data, error } = storageClient
      .from("user_uploads")
      .getPublicUrl(`${filePath}/${filenameWithExtension}`);

    if (error) {
      throw new Error(
        `Error retrieving public url for file ${filePath}/${filenameWithExtension}: ${error.message}`,
      );
    }

    const { publicUrl } = data;
    return publicUrl;
  };

  const createDownloadUrl = async (filePath, filename) => {
    const linkTimeout = 30;
    const { data, error } = await storageClient
      .from("user_uploads")
      .createSignedUrl(`${filePath}/${filename}`, linkTimeout, {
        download: true,
      });

    if (error) {
      throw new Error(
        `Error creating download url for file ${filePath}/${filename}: ${error.message}`,
      );
    }

    const { signedUrl } = data;
    return signedUrl;
  };

  return {
    getMulterOptions,
    uploadFile,
    updateFile,
    deleteFile,
    getStoragePath,
    createDownloadUrl,
  };
})();

const toTitleCase = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const getPopupObject = (CRUDType, entityType, entityId = null) => {
  let entityPath;
  let title;
  let submitButtonName;

  if (CRUDType === "create") {
    entityPath = `/create/${entityType}`;
    title = `New ${toTitleCase(entityType)}`;
    submitButtonName = entityType === "folder" ? "Create" : "Upload";
  } else {
    if (!entityId) {
      throw new Error(
        `Entity ID: ${entityId} does not exist upon to change the link's url for edition`,
      );
    }

    if (CRUDType === "edit") {
      entityPath = `/edit/${entityType}/${entityId}`;
      title = `Edit ${toTitleCase(entityType)}`;
      submitButtonName = "Edit";
    } else {
      entityPath = `/delete/${entityType}/${entityId}`;
      title = `Delete ${toTitleCase(entityType)}`;
      submitButtonName = "Delete";
    }
  }

  const popup = {
    path: entityPath,
    name: entityType,
    title,
    submitButtonName,
    hasFileInput: entityType === "file",
  };

  return popup;
};

const getEntityIcon = (entity) => {
  if (!entity.file) {
    return "folder";
  }
  const { extension } = entity.file;

  if (extension.startsWith("image/")) return "image";
  if (extension.startsWith("video/")) return "video";
  if (extension.startsWith("audio/")) return "audio";
  if (extension === "application/pdf") return "document";
  return "file";
};

const mapEntityForUI = async (entity) => {
  let filePath;
  let extension;
  let storagePath;
  if (entity.file && entity.predecessorId) {
    filePath = await getPathFromEntityId(entity.predecessorId);

    extension = mime.extension(entity.file.extension);
    storagePath = storageHandler.getStoragePath(
      filePath,
      entity.name,
      extension,
    );
    extension = extension.toUpperCase();
  }

  return {
    ...entity,
    ...(entity.file && {
      file: {
        ...entity.file,
        extension,
        storagePath,
        createdAt: format(entity.file.createdAt, "yyyy-MM-dd HH:mm"),
        size: filesize(entity.file.size),
        uploadTime: prettyMilliseconds(entity.file.uploadTime),
      },
    }),
    icon: getEntityIcon(entity),
    type: entity.file ? "file" : "folder",
  };
};

const getSidebarInformations = async (req) => {
  const iconNames = [
    {
      folderName: req.user.username,
      iconName: "home",
    },
    {
      folderName: "documents",
      iconName: "file-text",
    },
    {
      folderName: "images",
      iconName: "image",
    },
    {
      folderName: "videos",
      iconName: "film",
    },
    {
      folderName: "music",
      iconName: "music",
    },
  ];

  const { id: userId, username } = req.user;

  const sidebarInformations = (
    await db.getSidebarFolders(userId, username)
  ).map(({ id, name }) => ({
    folderId: id,
    name,
    iconName: iconNames.find(({ folderName }) => folderName === name).iconName,
  }));

  return sidebarInformations;
};

export {
  validationErrorMessages,
  validateEntity,
  getNodesFromEntityId,
  getPathFromEntityId,
  getPopupObject,
  getEntityIcon,
  mapEntityForUI,
  getSidebarInformations,
  storageHandler,
};
