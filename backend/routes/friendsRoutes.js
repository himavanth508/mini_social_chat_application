const express = require('express');
const router = express.Router();
const friendsController = require('../components/friends');

router.post('/request', friendsController.sendRequest);
router.post('/accept', friendsController.acceptRequest);
router.get('/list', friendsController.listFriends);
router.get('/search', friendsController.searchUsers);
router.get('/pending', friendsController.listPending);

module.exports = router;
