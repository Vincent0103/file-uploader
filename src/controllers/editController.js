import { validationResult } from "express-validator";
import multer from "multer";
import {
  getPathFromEntityId,
  storageHandler,
  validateEntity,
} from "../scripts/utils.js";
import db from "../db/queries.js";
import folderController from "./folderController.js";

const loginController = (() => {
  const editFolderPost = [
    validateEntity("Folder", "folderName", "Foldername"),
    async (req, res) => {
      const errors = validationResult(req);
      const folderId = parseInt(req.params.folderId, 10);
      const { folderName } = req.body;

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(
          req,
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
    validateEntity("File", "filename", "Filename"),
    async (req, res) => {
      const errors = validationResult(req);
      const fileId = parseInt(req.params.fileId, 10);
      const { filename } = req.body;

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, false, fileId);
        return res.status(401).render("index", {
          ...params,
          filename,
          errors: errors.array(),
        });
      }

      const parentFolderId = parseInt(req.body.parentFolderId, 10);
      const path = await getPathFromEntityId(parentFolderId);

      const entity = await db.getEntityById(fileId);

      await storageHandler.updateFile(
        path,
        entity.name,
        filename,
        entity.file.extension,
      );

      await db.editFile(fileId, filename);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { editFolderPost, editFilePost };
})();

export default loginController;
