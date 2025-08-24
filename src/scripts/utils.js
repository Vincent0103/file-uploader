import { body } from "express-validator";
import { filesize } from "filesize";
import { format } from "date-fns";
import multer from "multer";
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
    const folder = await db.getFolderById(currentEntityId);
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
  const uploadFile = async (filePath, filename, fileBody) => {
    const { error } = await storageClient
      .from("user_uploads")
      .upload(`${filePath}/${filename}`, fileBody);

    if (error) {
      console.error("Supabase client error:", error.code, error.message);
    }
  };

  const getStoragePath = (filePath, originalname) => {
    const { data, error } = storageClient
      .from("user_uploads")
      .getPublicUrl(`${filePath}/${originalname}`);

    if (error) {
      throw new Error(
        `Error retrieving public url file ${filePath}/${originalname}: ${error.message}`,
      );
    }

    const { publicUrl } = data;
    return publicUrl;
  };

  return { getMulterOptions, uploadFile, getStoragePath };
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

const mapEntityForUI = (entity) => ({
  ...entity,
  ...(entity.file && {
    file: {
      ...entity.file,
      createdAt: format(entity.file.createdAt, "yyyy-MM-dd HH:mm"),
      size: filesize(entity.file.size),
      uploadTime: prettyMilliseconds(entity.file.uploadTime),
    },
  }),
  icon: getEntityIcon(entity),
  type: entity.file ? "file" : "folder",
});

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
