import express from "express";
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from "../controllers/todoController.js";
import auth from "../middlewares/auth.js";
import authorize from "../middlewares/authorize.js";

const todoRouter = express.Router();

todoRouter.get("/", auth, getTasks);

todoRouter.post("/", auth, createTask);

todoRouter.delete("/:id", auth, deleteTask);

todoRouter.put("/:id", auth, updateTask);

export default todoRouter;
