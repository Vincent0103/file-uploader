import { body } from "express-validator";
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
  const path = srcPath.slice(0, lastIndexOfSlash + 1);
  const name = srcPath.slice(lastIndexOfSlash + 1, srcPath.length);

  let folder = await db.getFolderByNameAndPath(userId, name, path);

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

export { validationErrorMessages, validateEntity, getNodesFromPath };
