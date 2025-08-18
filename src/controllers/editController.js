import path from "path";
import { validationResult } from "express-validator";
import multer from "multer";
import { validateEntity } from "../utils/utils";
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

  const destinationPath = path.join(__dirname, "../../public/uploads");
  const upload = multer({ dest: destinationPath });

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

      const { path: folderPath } = await db.getFolderById(userId, fileId);

      const fileInfos = {
        size: req.file.size,
        extension: req.file.mimetype,
      };
      await db.createFile(userId, fileName, fileInfos, folderPath, fileId);
      return res.redirect(`/folder/${parentFolderId}`);
    },
  ];

  return { editFolderPost, editFilePost };
})();

export default loginController;
