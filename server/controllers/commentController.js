import commentModel from "../models/commentModel.js";
import Mongoose from "mongoose";
const createComment = async (req, res) => {
  const { comment, userId } = req.body;
  const id = req.params.id;
  const newComment = new commentModel({
    comment: comment,
    postId: id,
    userId: userId,
  });
  try {
    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    const comment = await commentModel.findByIdAndDelete(id);
    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Somethong went Wrong" });
  }
};

const getComments = async (req, res) => {
  try {
    // const comments = await commentModel.find({ postId: req.params.id });
    // console.log(req.params.id)
    const pid = new Mongoose.Types.ObjectId(req.params.id)
    const comments = await commentModel.aggregate([
      {$match:{postId:pid}},
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
    res.status(200).json(comments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// const getComments = async (req, res) => {
//   try {
//     const comments = await commentModel.find({ postId: req.params.id });
//     res.status(200).json(comments);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

export { createComment, deleteComment, getComments };
