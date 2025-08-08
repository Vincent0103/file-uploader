import { body, validationResult } from "express-validator";
import { validationErrorMessages } from "../utils/utils";
import db from "../db/queries";

const loginController = (() => {
  const validateFolder = [
    body("folderName")
      .trim()
      .isLength({ min: 3, max: 255 })
      .withMessage(`Username ${validationErrorMessages.lengthErr(3, 255)}`)
      .isAlphanumeric("en-US", { ignore: "_-" })
      .withMessage(`Username ${validationErrorMessages.alphanumericErr}`)
      .custom(async (value, { req }) => {
        const { id: userId } = req.user;
        const folderExists = await db.doesFolderExistsInPath(
          userId,
          value,
          path,
        );
        if (folderExists) {
          throw new Error(`Folder "${value}" already exists.`);
        }
        return true;
      }),
  ];

  const createFolderPost = (req, res) => {
    return res.render("login");
  };

  const createFilePost = (req, res) => {
    return res.redirect("/");
  };

  return { createFolderPost, createFilePost };
})();

export default loginController;
