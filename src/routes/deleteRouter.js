import { Router } from "express";
import deleteController from "../controllers/deleteController.js";

const deleteRouter = Router();
deleteRouter.post("/:entityId", deleteController.deleteFolderPost);

export default deleteRouter;
