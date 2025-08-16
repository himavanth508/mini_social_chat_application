import express from "express";
import userRouter from "./routes/userRoutes.js";
import todoRouter from "./routes/todoRoutes.js";
import postRouter from "./routes/postRoutes.js";
import commentRouter from "./routes/commentRoutes.js";
import likeRouter from "./routes/likeRoutes.js";
import mongoose from "mongoose";
import path from "path"
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
app.use("/images", express.static("images"));


app.use("/users", userRouter);
app.use("/todos", todoRouter);
app.use("/posts", postRouter);
app.use("/comments", commentRouter);
app.use("/likes", likeRouter);

// app.use("/products", postRouter);


mongoose
  .connect("mongodb://127.0.0.1:27017/socialdb1")
  .then(() => {
    app.listen(8080, () => {
      console.log("Server Started on port 8080");
    });
  })
  .catch((error) => {
    console.log(error);
  });
