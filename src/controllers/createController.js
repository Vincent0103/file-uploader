import { validationResult } from "express-validator";
import multer from "multer";
import { filesize } from "filesize";
import mime from "mime-types";
import {
  getPathFromEntityId,
  storageHandler,
  validateEntity,
} from "../scripts/utils.js";
import folderController from "./folderController.js";
import db from "../db/queries.js";

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
          errors: errors.array(),
        });
      }

      const { id: userId } = req.user;
      const { folderName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      await db.createFolder(userId, folderName, parentFolderId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  const upload = multer(storageHandler.getMulterOptions()).single(
    "uploadedFile",
  );

  const createFilePost = [
    (req, res, next) => {
      upload(req, res, (err) => {
        if (err) req.multerError = err;
        next();
      });
    },
    validateEntity("File", "filename", "Filename"),
    async (req, res) => {
      const errors = validationResult(req);
      let params;

      if (req.multerError) {
        const maxSize = 10000; // =10Mb
        errors.errors.push({
          type: "field",
          value: "",
          msg: `file ${req.body.filename} is too big. Expected <${filesize(maxSize)}`,
          path: "uploadedFile",
          location: "body",
        });
      }

      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req);
        return res.status(401).render("index", {
          ...params,
          errors: errors.array(),
        });
      }

      const parentFolderId = parseInt(req.body.parentFolderId, 10);
      const { filename } = req.body;

      const path = await getPathFromEntityId(parentFolderId);
      const { size, mimetype, buffer } = req.file;
      const extension = mime.extension(mimetype);

      const uploadStartTime = Date.now();

      // HANDLE ERROR IF FILE DONT UPLOAD
      await storageHandler.uploadFile(path, buffer, filename, extension);

      const uploadEndTime = Date.now();
      const uploadTime = Math.abs(uploadStartTime - uploadEndTime);

      const fileInfos = {
        size,
        uploadTime,
        extension: mimetype,
      };

      const { id: userId } = req.user;
      await db.createFile(userId, filename, fileInfos, parentFolderId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { createFolderPost, createFilePost };
})();

export default loginController;
