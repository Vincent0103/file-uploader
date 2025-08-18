import path from "path";
import { validationResult } from "express-validator";
import multer from "multer";
import { validateEntity } from "../utils/utils";
import db from "../db/queries";
import folderController from "./folderController";

const loginController = (() => {
  const createFolderPost = [
    validateEntity("Folder", "folderName", "Foldername"),
    async (req, res) => {
      const errors = validationResult(req);
      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req);
        return res.status(401).render("index", {
          ...params,
          hasPopupFolderErrors: true,
          errors: errors.array(),
        });
      }

      const { id: userId } = req.user;
      const { folderName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const { path: folderPath } = await db.getFolderById(
        userId,
        parentFolderId,
      );
      await db.createFolder(userId, folderName, folderPath, parentFolderId);
      return res.redirect(`/folder/${parentFolderId}`);
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
        params = await folderController.getIndexViewParams(req);
        return res.status(401).render("index", {
          ...params,
          hasPopupFileErrors: true,
          errors: errors.array(),
        });
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
