import { Router } from "express";
import editController from "../controllers/editController";

const editRouter = Router();
editRouter.post("/folder/:folderId", editController.editFolderPost);
editRouter.post("/file/:fileId", editController.editFilePost);

export default editRouter;
