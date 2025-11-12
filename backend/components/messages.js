const db = require('../db/mongodb');

// get conversation between two users (both directions)
exports.getConversation = async (req, res) => {
  try {
    const { user1, user2 } = req.query || {};
    if (!user1 || !user2) return res.status(400).send('user1 and user2 required');

    const messages = db.collection('messages');
    const conv = await messages.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    }).sort({ createdAt: 1 }).toArray();

    res.status(200).send({ ok: true, messages: conv });
  } catch (err) {
    console.error('getConversation error', err);
    res.status(500).send('getConversation error');
  }
};
