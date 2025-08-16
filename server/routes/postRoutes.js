import express from "express";
import multer from "multer";
import {
  getPosts,
  createPost,
  deletePost,
  updatePost,
} from "../controllers/postController.js";
import auth from "../middlewares/auth.js";

import authorize from "../middlewares/authorize.js";

const postRouter = express.Router();

postRouter.use(auth);

postRouter.get("/", getPosts);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    req.filePath = "http://localhost:8080/images/" + fileName;
    cb(null, fileName);
  },
});
const upload = multer({ storage: storage });

// postRouter.post("/", upload.single("file"), createPost);
postRouter.post("/", createPost);

postRouter.delete("/:id", deletePost);

postRouter.put("/:id", updatePost);

export default postRouter;
