import express from "express";
import {
  getLikes,
  toggleLike,
} from "../controllers/likeController.js";
import auth from "../middlewares/auth.js";

import authorize from "../middlewares/authorize.js";

const likeRouter = express.Router();

// commentRouter.use(auth);

likeRouter.get("/:id", getLikes);

likeRouter.post("/:uid/:pid", toggleLike);


export default likeRouter;
