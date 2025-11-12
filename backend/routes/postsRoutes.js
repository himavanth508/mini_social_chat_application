const express = require('express');
const router = express.Router();
const postsController = require('../components/posts');

router.post('/', postsController.createPost);
router.get('/feed', postsController.getFeed);
router.post('/:id/comment', postsController.commentOnPost);
router.get('/user', postsController.getUserPosts);

module.exports = router;
