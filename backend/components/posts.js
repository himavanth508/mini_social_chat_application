const db = require('../db/mongodb');
const { ObjectId } = require('mongodb');

exports.createPost = async (req, res) => {
  try {
    const { author, text, media } = req.body || {};
    if (!author) return res.status(400).send('author required');

    const posts = db.collection('posts');
    const now = new Date();
    const doc = { author, text: text || '', media: media || [], comments: [], createdAt: now };
    const r = await posts.insertOne(doc);
    res.status(201).send({ ok: true, postId: r.insertedId, post: doc });
  } catch (err) {
    console.error('createPost error', err);
    res.status(500).send('createPost error');
  }
};

// get feed: posts by user and their friends (friends is array of usernames)
exports.getFeed = async (req, res) => {
  try {
    const username = req.query.username; // authenticated username expected
    if (!username) return res.status(400).send('username required');

    // get friends list
    const friendships = db.collection('friendships');
    const fdocs = await friendships.find({ members: username, status: 'accepted' }).toArray();
    const friends = new Set();
    fdocs.forEach(f => {
      (f.members || []).forEach(m => { if (m !== username) friends.add(m); });
    });

    const authors = Array.from(friends);
    authors.push(username);

    const posts = db.collection('posts');
    const feed = await posts.find({ author: { $in: authors } }).sort({ createdAt: -1 }).limit(50).toArray();
    res.status(200).send({ ok: true, feed });
  } catch (err) {
    console.error('getFeed error', err);
    res.status(500).send('getFeed error');
  }
};

// get posts for a specific user (their own posts)
exports.getUserPosts = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).send('username required');

    const posts = db.collection('posts');
    const userPosts = await posts.find({ author: username }).sort({ createdAt: -1 }).limit(200).toArray();
    res.status(200).send({ ok: true, posts: userPosts });
  } catch (err) {
    console.error('getUserPosts error', err);
    res.status(500).send('getUserPosts error');
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { author, text } = req.body || {};
    if (!postId || !author || !text) return res.status(400).send('postId, author and text required');

    const posts = db.collection('posts');
    const comment = { _id: new ObjectId(), author, text, createdAt: new Date() };
    await posts.updateOne({ _id: new ObjectId(postId) }, { $push: { comments: comment } });
    res.status(200).send({ ok: true, comment });
  } catch (err) {
    console.error('commentOnPost error', err);
    res.status(500).send('commentOnPost error');
  }
};
