import mongoose from 'mongoose'

const postSchema = mongoose.Schema(
  {
    Post: { type: String, required: true },
    file:{ type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // email: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
