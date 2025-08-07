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

export default validationErrorMessages;
