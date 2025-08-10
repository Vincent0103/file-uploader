import path from "path";
import { body, validationResult } from "express-validator";
import multer from "multer";
import { validationErrorMessages } from "../utils/utils";
import db from "../db/queries";
import folderController from "./folderController";

const loginController = (() => {
  const validateEntity = (name, attributeName, messageName) => [
    body(attributeName)
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage(
        `${messageName} ${validationErrorMessages.lengthErr(1, 255)}`,
      )
      .custom(async (value, { req }) => {
        const { id: userId } = req.user;
        const folderId = parseInt(req.body.folderId, 10);

        const entityExists = await db.doesEntityExistsInPath(
          userId,
          value,
          folderId,
        );

        if (entityExists) {
          throw new Error(`${name} "${value}" already exists.`);
        }
        return true;
      }),
  ];

  const createFolderPost = [
    validateEntity("Folder", "folderName", "Foldername"),
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

      const { path: folderPath } = await db.getFolderById(userId, folderId);
      await db.createFolder(userId, folderName, folderPath, folderId);
      return res.redirect(`/folder/${folderId}`);
    },
  ];

  const destinationPath = path.join(__dirname, "../../public/uploads");
  const upload = multer({ dest: destinationPath });

  const createFilePost = [
    upload.single("uploadedFile"),
    validateEntity("File", "fileName", "Filename"),
    async (req, res) => {
      const errors = validationResult(req);
      let params;

      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, false, true);
        return res
          .status(401)
          .render("index", { ...params, errors: errors.array() });
      }

      const { id: userId } = req.user;
      const { fileName } = req.body;
      const folderId = parseInt(req.body.folderId, 10);

      const { path: folderPath } = await db.getFolderById(userId, folderId);

      const fileInfos = {
        size: req.file.size,
        extension: req.file.mimetype,
      };
      await db.createFile(userId, fileName, fileInfos, folderPath, folderId);
      return res.redirect(`/folder/${folderId}`);
    },
  ];

  return { createFolderPost, createFilePost };
})();

export default loginController;
