const express = require('express');
const router = express.Router();
const messagesController = require('../components/messages');

router.get('/conversation', messagesController.getConversation);

module.exports = router;
