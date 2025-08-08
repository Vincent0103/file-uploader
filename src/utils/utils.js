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

const getNodesAndPaths = (srcPath) => {
  const cb = (nodes, i = 0) => {
    if (nodes.length === i) return {};

    let path;
    if (i > 0) {
      path = nodes[i - 1].path.concat(nodes[i]);
    } else {
      path = `/${nodes[i]}`;
    }

    // eslint-disable-next-line no-param-reassign
    nodes[i] = {
      self: nodes[i],
      path,
    };

    return cb(nodes, i + 1);
  };

  const nodes = srcPath.split("/");
  cb(nodes);

  console.log(nodes);
  return nodes;
};

export { validationErrorMessages, getNodesAndPaths };
