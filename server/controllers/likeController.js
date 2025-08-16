import likeModel from "../models/likeModel.js"

const createLike = async (uid,pid) => {
  const newLike = new likeModel({
    userId: uid,
    postId: pid,
  });
  try {
    await newLike.save();
  } catch (error) {
    console.log(error);
  }
};

const deleteLike = async (id) => {
  try {
    const like = await likeModel.findByIdAndDelete(id);
  } catch (error) {
    console.log(error);
  }
};

const toggleLike = async (req, res) => {
    const uid = req.params.uid;
    const pid = req.params.pid;
    try {
      const result = await likeModel.findOne({userId:uid,postId:pid});
      if (result) deleteLike(result._id)
      else createLike(uid,pid)
      res.status(200).json("Done");
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Somethong went Wrong" });
    }
  };
  

const getLikes = async (req, res) => {
  try {
    const likes = await likeModel.find({ postId: req.params.id });
    res.status(200).json(likes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export { toggleLike, getLikes };
