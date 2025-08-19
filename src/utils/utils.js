import { body } from "express-validator";
import multer from "multer";
import path from "path";
import db from "../db/queries";

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
      const { id: userId } = req.user;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const entityExists = await db.doesEntityExistsInPath(
        userId,
        value,
        parentFolderId,
      );

      if (entityExists) {
        throw new Error(`${name} "${value}" already exists.`);
      }
      return true;
    }),
];

const getNodesFromPath = async (srcPath, userId) => {
  const nodes = [];

  // The next loop doesn't follow eslint good practices but is necessary
  // so that it runs *sequentially* and doesn't cause race conditions.

  const lastIndexOfSlash = srcPath.lastIndexOf("/");
  const narrowedPath = srcPath.slice(0, lastIndexOfSlash + 1);
  const name = srcPath.slice(lastIndexOfSlash + 1, srcPath.length);

  let folder = await db.getFolderByNameAndPath(userId, name, narrowedPath);

  nodes.push({
    name,
    folderId: folder.id,
  });
  while (folder.predecessorId) {
    folder = await db.getFolderById(userId, folder.predecessorId);

    nodes.push({
      name: folder.name,
      folderId: folder.id,
    });
  }

  nodes.reverse();
  return nodes;
};

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

const getStorage = () => {
  const destinationPath = path.join(__dirname, "../../public/uploads");
  const storage = multer.diskStorage({
    destination: destinationPath,
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const filename = `${file.fieldname.toLowerCase()}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  });

  return storage;
};

const getFileIcon = (entity) => {
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

export {
  validationErrorMessages,
  validateEntity,
  getNodesFromPath,
  getPopupObject,
  getStorage,
  getFileIcon,
};
