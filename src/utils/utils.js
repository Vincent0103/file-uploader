import db from "../db/queries";

const validationErrorMessages = (() => {
  const lengthErr = (min, max) => `must be between ${min} and ${max}.`;
  const alphanumericErr =
    "must only contain letters, numbers, spaces and one of these characters (_-).";
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
  let nodes = srcPath.split("/").filter((node) => !!node);
  let currentPath = "";

  nodes = await Promise.all(
    nodes.map(async (node) => {
      currentPath = currentPath.concat(`/${node}`);
      const folder = await db.getPredecessorByPath(userId, currentPath);
      const folderId = folder ? folder.id : null;

      return {
        name: node,
        folderId,
      };
    }),
  );

  return nodes;
};

const main = async () => {
  const nodes = await getNodesObject("/home/documents", 3);
};

main();

export { validationErrorMessages, getNodesObject };
