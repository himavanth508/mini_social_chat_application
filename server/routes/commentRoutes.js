import express from "express";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/commentController.js";
import auth from "../middlewares/auth.js";

import authorize from "../middlewares/authorize.js";

const commentRouter = express.Router();

// commentRouter.use(auth);

commentRouter.get("/:id", getComments);

commentRouter.post("/:id", createComment);

commentRouter.delete("/:id", deleteComment);

export default commentRouter;
