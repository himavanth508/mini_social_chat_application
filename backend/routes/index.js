const express = require("express");
const router =  express.Router();

const authRouter = require("./authRoutes");
const postsRouter = require("./postsRoutes");
const friendsRouter = require("./friendsRoutes");
const uploadsRouter = require('./uploadsRoutes');
const messagesRouter = require('./messagesRoutes');

router.use('/auth',authRouter);
router.use('/posts', postsRouter);
router.use('/friends', friendsRouter);
router.use('/uploads', uploadsRouter);
router.use('/messages', messagesRouter);

module.exports= router;
