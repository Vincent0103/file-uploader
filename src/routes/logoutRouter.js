import { Router } from "express";
import logoutController from "../controllers/logoutController.js";

const logoutRouter = Router();
logoutRouter.get("/", logoutController.logoutGet);

export default logoutRouter;
