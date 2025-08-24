import { Router } from "express";
import downloadController from "../controllers/downloadController.js";

const downloadRouter = Router();
downloadRouter.get("/:fileId", downloadController.downloadGet);

export default downloadRouter;
