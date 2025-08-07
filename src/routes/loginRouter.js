import { Router } from "express";
import loginController from "../controllers/loginController";

const loginRouter = Router();
loginRouter.get("/", loginController.loginGet);
loginRouter.post("/", loginController.loginPost);

export default loginRouter;
