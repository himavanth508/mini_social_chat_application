import mongoose from 'mongoose'

const likeSchema = mongoose.Schema(
  {
    postId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("likes", likeSchema);
