import { Router } from "express";
import signupController from "../controllers/signupController";

const signupRouter = Router();
signupRouter.get("/", signupController.signupGet);
signupRouter.post("/", signupController.signupPost);

export default signupRouter;
