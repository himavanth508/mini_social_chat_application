import postModel from "../models/postModel.js";
import fs from "fs";

import formidable from "formidable";
const createPost = async (req, res) => {
  const form = formidable({});
  form.parse(req, async (err, fields, files) => {
    var oldpath = files.file[0].filepath;
    var newpath =
      "C:/Users/nairx/myprojects/social-mern/server/images/" +
      Date.now() +
      "-" +
      files.file[0].originalFilename;
    fs.rename(oldpath, newpath, function (err) {
      console.log(err);
    });
    const filePath = "http://localhost:8080/images/" + newpath.split("/").pop();
    const newPost = new postModel({
      Post: fields.Post[0],
      file: filePath,
      userId: req.userId,
    });
    await newPost.save();
    res.status(201).json(newPost);
    // res.status(200).json({ fields, files });
  });
};

const deletePost = async (req, res) => {
  const id = req.params.id;
  try {
    const del_file = await postModel.findOne({ _id: id });
    if (del_file.file) {
      const fname = "images/" + del_file.file.split("/").pop();
      fs.unlink(fname, function (err) {
        if (err) throw err;
        console.log("File deleted!");
      });
    }
    const Post = await postModel.findByIdAndDelete(id);
    res.status(200).json(Post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Somethong went Wrong" });
  }
};

const updatePost = async (req, res) => {
  const id = req.params.id;
  const { Post } = req.body;
  const newPost = {
    Post: Post,
    userId: req.userId,
  };
  try {
    await postModel.findByIdAndUpdate(id, newPost, { new: true });
    res.status(200).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getPosts = async (req, res) => {
  try {
    // const Posts = await postModel.find({ userId: req.userId });

    const Posts = await postModel.aggregate([
      {
        $addFields: {
          daydiff: {
            $dateDiff: {
              startDate: "$createdAt",
              endDate: new Date(),
              unit: "day",
            },
          },
        },
      },
      { $project: { Post: 1, userId: 1, file: 1, createdAt: 1, daydiff: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "users",
        },
      },
      { $sort: { _id: -1 } },
    ]);
    res.status(200).json(Posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// const getPosts = async (req, res) => {
//   try {
//     // const Posts = await postModel.find({ userId: req.userId });

//     const Posts = await postModel.aggregate([
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "users",
//         },
//       },
//       { $sort: { _id: -1 } },
//     ]);
//     res.status(200).json(Posts);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

export { createPost, deletePost, updatePost, getPosts };
