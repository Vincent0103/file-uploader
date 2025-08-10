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

const getNodesObject = async (srcPath, userId) => {
  // filter removes empty strings especially at the beginning of the split
  const nodes = srcPath.split("/").filter((node) => !!node);
  let currentPath = "/";
  const obj = [];

  // The next loop doesn't follow eslint good practices but is necessary
  // so that it runs *sequentially* and doesn't cause race conditions.

  // eslint-disable-next-line no-restricted-syntax
  for (const node of nodes) {
    // eslint-disable-next-line no-await-in-loop
    const folder = await db.getFolderByNameAndPath(userId, node, currentPath);
    const folderId = folder ? folder.id : null;
    currentPath = currentPath.concat(`${node}/`);

    obj.push({
      name: node,
      folderId,
    });
  }

  return obj;
};

export { validationErrorMessages, getNodesObject };
