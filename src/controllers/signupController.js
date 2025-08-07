import { body, validationResult } from "express-validator";
import db from "../db/queries";
import validationErrorMessages from "../utils/utils";

const signupController = (() => {
  const passwordValidationRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  const validateSignup = [
    body("username")
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage(`Username ${validationErrorMessages.lengthErr(3, 255)}`)
      .isAlphanumeric("en-US", { ignore: "_-" })
      .withMessage(`Username ${validationErrorMessages.alphanumericErr}`)
      .custom(async (value) => {
        const userExists = await db.hasUserByUsername(value);
        if (userExists) {
          throw new Error(`Username "${value}" already exists.`);
        }
        return true;
      }),
    body("password")
      .isLength({ min: 8, max: 128 })
      .withMessage(`Password ${validationErrorMessages.lengthErr(8, 128)}`)
      .matches(passwordValidationRegex)
      .withMessage([
        "- Password must:",
        `• ${validationErrorMessages.lowerCaseErr}`,
        `• ${validationErrorMessages.upperCaseErr}`,
        `• ${validationErrorMessages.digitErr}`,
        `• ${validationErrorMessages.specialCharErr}`,
      ]),
    body("confirmPassword").custom((value, { req }) => {
      if (!req.body.password.match(passwordValidationRegex)) {
        return true;
      }
      if (value !== req.body.password) {
        throw new Error(`Passwords ${validationErrorMessages.matchErr}`);
      }
      return true;
    }),
  ];

  const signupGet = (req, res) => {
    return res.render("signup");
  };

  const signupPost = [
    validateSignup,
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        const { username, password } = req.body;
        if (!errors.isEmpty()) {
          return res.status(401).render("signup", {
            errors: errors.array(),
            username,
          });
        }

        await db.createUser({ username, password });
        return res.redirect("/login");
      } catch (err) {
        console.error(err);
        return next(err);
      }
    },
  ];

  return { signupGet, signupPost };
})();

export default signupController;
