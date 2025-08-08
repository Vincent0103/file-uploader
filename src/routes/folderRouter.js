import { Router } from "express";
import folderController from "../controllers/folderController";

const folderRouter = Router();
// folderRouter.get("/", (req, res) => res.send("Folder endpoint"));
folderRouter.get("/:folderId", folderController.folderGet);

export default folderRouter;
