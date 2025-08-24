import { validationResult } from "express-validator";
import multer from "multer";
import { filesize } from "filesize";
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
    async (req, res, next) => {
      const errors = validationResult(req);

      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, next);
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
    validateEntity("File", "fileName", "Filename"),
    async (req, res, next) => {
      const errors = validationResult(req);
      let params;

      if (req.multerError) {
        const maxSize = 10000; // =10Mb
        errors.errors.push({
          type: "field",
          value: "",
          msg: `file ${req.body.fileName} is too big. Expected <${filesize(maxSize)}`,
          path: "uploadedFile",
          location: "body",
        });
      }

      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, next);
        return res.status(401).render("index", {
          ...params,
          errors: errors.array(),
        });
      }

      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const uploadStartTime = Date.now();

      // HANDLE ERROR IF FILE DONT UPLOAD
      const path = await getPathFromEntityId(parentFolderId);
      await storageHandler.uploadFile(
        path,
        req.file.originalname,
        req.file.buffer,
      );

      const uploadEndTime = Date.now();
      const uploadTime = Math.abs(uploadStartTime - uploadEndTime);

      const { id: userId } = req.user;
      const { fileName } = req.body;

      const fileInfos = {
        size: req.file.size,
        uploadTime,
        extension: req.file.mimetype,
      };

      await db.createFile(userId, fileName, fileInfos, parentFolderId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { createFolderPost, createFilePost };
})();

export default loginController;
