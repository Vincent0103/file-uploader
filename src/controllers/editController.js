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
      let params;
      if (!errors.isEmpty()) {
        params = await folderController.getIndexViewParams(req, true);
        return res
          .status(401)
          .render("index", { ...params, errors: errors.array() });
      }

      const { id: userId } = req.user;
      const { folderName } = req.body;
      const parentFolderId = parseInt(req.body.parentFolderId, 10);

      const { folderId } = req.params;
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

  return { editFolderPost, editFilePost };
})();

export default loginController;
