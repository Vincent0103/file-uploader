import { body, validationResult } from "express-validator";
import { validationErrorMessages } from "../utils/utils";
import db from "../db/queries";

const loginController = (() => {
  // const validateFolder = [
  //   body("folderName")
  //     .trim()
  //     .isLength({ min: 3, max: 255 })
  //     .withMessage(`Username ${validationErrorMessages.lengthErr(3, 255)}`)
  //     .isAlphanumeric("en-US", { ignore: "_-" })
  //     .withMessage(`Username ${validationErrorMessages.alphanumericErr}`)
  //     .custom(async (value) => {
  //       const userExists = await db.doesFolderExistsInPath(folder, path);
  //       if (userExists) {
  //         throw new Error(`Username "${value}" already exists.`);
  //       }
  //       return true;
  //     }),
  // ];

  const createFolderPost = (req, res) => {
    return res.render("login");
  };

  const createFilePost = (req, res) => {
    console.log(req.file);
    return res.redirect("/");
  };

  return { createFolderPost, createFilePost };
})();

export default loginController;
