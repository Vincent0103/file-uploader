import { body, validationResult } from "express-validator";
import { validationErrorMessages } from "../utils/utils";
import db from "../db/queries";
import folderController from "./folderController";

const loginController = (() => {
  const validateFolder = [
    body("folderName")
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage(`folderName ${validationErrorMessages.lengthErr(1, 255)}`)
      .custom(async (value, { req }) => {
        const { id: userId } = req.user;
        const { folderId } = req.params;

        const folderExists = await db.doesFolderExistsInPath(
          userId,
          value,
          folderId,
        );
        if (folderExists) {
          throw new Error(`Folder "${value}" already exists.`);
        }
        return true;
      }),
  ];

  const createFolderPost = [
    validateFolder,
    async (req, res) => {
      const errors = validationResult(req);
      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, true);
        return res
          .status(401)
          .render("index", { ...params, errors: errors.array() });
      }

      const { id: userId } = req.user;
      const { folderName } = req.body;
      const folderId = parseInt(req.body.folderId, 10);

      const { path } = await db.getFolderById(userId, folderId);
      await db.createFolder(userId, folderName, path, folderId);
      return res.redirect(`/folder/${folderId}`);
    },
  ];

  const createFilePost = (req, res) => {
    return res.redirect("/");
  };

  return { createFolderPost, createFilePost };
})();

export default loginController;
