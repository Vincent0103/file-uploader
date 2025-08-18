import path from "path";
import { validationResult } from "express-validator";
import multer from "multer";
import { getStorage, validateEntity } from "../utils/utils";
import db from "../db/queries";
import folderController from "./folderController";

const loginController = (() => {
  const editFolderPost = [
    validateEntity("Folder", "folderName", "Foldername"),
    async (req, res) => {
      const errors = validationResult(req);
      const folderId = parseInt(req.params.folderId, 10);

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(
          req,
          false,
          folderId,
        );

        return res.status(401).render("index", {
          ...params,
          hasPopupFolderErrors: true,
          errors: errors.array(),
        });
      }

      const { id: userId } = req.user;
      const { folderName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const folder = await db.editFolder(userId, folderId, folderName);
      console.log(`Edited: ${folder}`);

      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  const upload = multer({ storage: getStorage() });
  const editFilePost = [
    upload.single("uploadedFile"),
    validateEntity("File", "fileName", "Filename"),
    async (req, res) => {
      const errors = validationResult(req);
      const fileId = parseInt(req.params.fileId, 10);

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, false, fileId);
        return res.status(401).render("index", {
          ...params,
          hasPopupFileErrors: true,
          errors: errors.array(),
        });
      }

      const { id: userId } = req.user;
      const { fileName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const fileInfos = {
        size: req.file.size,
        storagePath: req.file.path,
        extension: req.file.mimetype,
      };
      await db.editFile(userId, fileId, fileName, fileInfos);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { editFolderPost, editFilePost };
})();

export default loginController;
