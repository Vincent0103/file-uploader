import { Router } from "express";
import logoutController from "../controllers/logoutController";

const logoutRouter = Router();
logoutRouter.get("/", logoutController.logoutGet);

export default logoutRouter;
