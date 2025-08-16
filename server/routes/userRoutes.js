import express from 'express'
const userRouter = express.Router();
import { signup, signin,googleLogin } from "../controllers/userController.js";
userRouter.post("/signup", signup);
userRouter.post("/signin", signin);
userRouter.post("/googleLogin", googleLogin);
export default userRouter;





