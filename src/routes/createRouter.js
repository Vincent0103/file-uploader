import { Router } from "express";
import createController from "../controllers/createController";
import path from "path";
import multer from "multer";

const createRouter = Router();
const destinationPath = path.join(__dirname, "../../public/uploads");
const upload = multer({ dest: destinationPath });
createRouter.post("/folder", createController.createFolderPost);
createRouter.post(
  "/file",
  upload.single("uploadedFile"),
  createController.createFilePost,
);

export default createRouter;
