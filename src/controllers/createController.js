import { validationResult } from "express-validator";
import multer from "multer";
import { filesize } from "filesize";
import { getMulterOptions, validateEntity } from "../utils/utils.js";
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

      const { path: folderPath } = await db.getFolderById(parentFolderId);
      await db.createFolder(userId, folderName, folderPath, parentFolderId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  const upload = multer(getMulterOptions()).single("uploadedFile");
  const createFilePost = [
    async (req, _res, next) => {
      const uploadStartTime = Date.now();
      req.uploadStartTime = uploadStartTime;
      next();
    },
    (req, res, next) => {
      upload(req, res, (err) => {
        if (err) req.multerError = err;
        next();
      });
    },
    async (req, _res, next) => {
      if (!req.multerError) {
        const uploadEndTime = Date.now();
        const uploadTime = Math.abs(req.uploadStartTime - uploadEndTime);
        delete req.uploadStartTime;

        req.body.uploadTime = uploadTime;
      }
      next();
    },
    validateEntity("File", "fileName", "Filename"),
    async (req, res) => {
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
        params = await folderController.getIndexViewParams(req);
        return res.status(401).render("index", {
          ...params,
          errors: errors.array(),
        });
      }

      const { id: userId } = req.user;
      const { fileName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);
      const uploadTime = parseInt(req.body.uploadTime, 10);

      const { path: folderPath } = await db.getFolderById(parentFolderId);

      const startingIndex = req.file.path.indexOf("/uploads/");
      const storagePath = req.file.path.substring(startingIndex);

      const fileInfos = {
        size: req.file.size,
        storagePath,
        uploadTime,
        extension: req.file.mimetype,
      };

      await db.createFile(
        userId,
        fileName,
        folderPath,
        fileInfos,
        parentFolderId,
      );
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { createFolderPost, createFilePost };
})();

export default loginController;
