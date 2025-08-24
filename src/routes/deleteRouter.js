import { Router } from "express";
import deleteController from "../controllers/deleteController.js";

const deleteRouter = Router();
deleteRouter.post("/:entityId", deleteController.deletePost);

export default deleteRouter;
