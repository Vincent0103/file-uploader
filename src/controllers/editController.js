import { validationResult } from "express-validator";
import multer from "multer";
import { storageHandler, validateEntity } from "../scripts/utils.js";
import db from "../db/queries.js";
import folderController from "./folderController.js";

const loginController = (() => {
  const editFolderPost = [
    validateEntity("Folder", "folderName", "Foldername"),
    async (req, res, next) => {
      const errors = validationResult(req);
      const folderId = parseInt(req.params.folderId, 10);
      const { folderName } = req.body;

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(
          req,
          next,
          false,
          folderId,
        );

        return res.status(401).render("index", {
          ...params,
          folderName,
          errors: errors.array(),
        });
      }

      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      await db.editFolder(folderId, folderName);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  const uploads = multer(storageHandler.getMulterOptions());
  const editFilePost = [
    uploads.none(), // Ensure no file upload is expected
    validateEntity("File", "fileName", "Filename"),
    async (req, res, next) => {
      const errors = validationResult(req);
      const fileId = parseInt(req.params.fileId, 10);
      const { fileName } = req.body;

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(
          req,
          next,
          false,
          fileId,
        );
        return res.status(401).render("index", {
          ...params,
          fileName,
          errors: errors.array(),
        });
      }

      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      await db.editFile(fileId, fileName);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { editFolderPost, editFilePost };
})();

export default loginController;
