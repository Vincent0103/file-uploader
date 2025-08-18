import { validationResult } from "express-validator";
import multer from "multer";
import { getStorage, validateEntity } from "../utils/utils";
import folderController from "./folderController";
import db from "../db/queries";

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

  const upload = multer({ storage: getStorage() });
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
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const { path: folderPath } = await db.getFolderById(
        userId,
        parentFolderId,
      );

      const fileInfos = {
        size: req.file.size,
        storagePath: req.file.path,
        extension: req.file.mimetype,
      };
      await db.createFile(
        userId,
        fileName,
        fileInfos,
        folderPath,
        parentFolderId,
      );
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { createFolderPost, createFilePost };
})();

export default loginController;
