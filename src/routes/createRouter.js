import { Router } from "express";
import createController from "../controllers/createController";

const createRouter = Router();
createRouter.post("/folder", createController.createFolderPost);
createRouter.post("/file", createController.createFilePost);

export default createRouter;
