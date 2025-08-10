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

export { validationErrorMessages, getNodesFromPath };
