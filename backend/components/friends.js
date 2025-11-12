const db = require('../db/mongodb');

// send friend request: members = [from, to], status = pending
exports.sendRequest = async (req, res) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) return res.status(400).send('from and to required');

    const friendships = db.collection('friendships');
    const existing = await friendships.findOne({ members: { $all: [from, to] } });
    if (existing) return res.status(400).send('friend request already exists or you are already friends');

    await friendships.insertOne({ members: [from, to], status: 'pending', createdAt: new Date(), actionBy: from });
    res.status(201).send({ ok: true });
  } catch (err) {
    console.error('sendRequest error', err);
    res.status(500).send('sendRequest error');
  }
};

// accept request
exports.acceptRequest = async (req, res) => {
  try {
    const { from, to } = req.body || {};
    if (!from || !to) return res.status(400).send('from and to required');

    const friendships = db.collection('friendships');
    await friendships.updateOne({ members: { $all: [from, to] } }, { $set: { status: 'accepted', acceptedAt: new Date() } });
    res.status(200).send({ ok: true });
  } catch (err) {
    console.error('acceptRequest error', err);
    res.status(500).send('acceptRequest error');
  }
};

// list friends for a user
exports.listFriends = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).send('username required');

    const friendships = db.collection('friendships');
    const fdocs = await friendships.find({ members: username, status: 'accepted' }).toArray();
    const friends = new Set();
    fdocs.forEach(f => (f.members || []).forEach(m => { if (m !== username) friends.add(m); }));

    res.status(200).send({ ok: true, friends: Array.from(friends) });
  } catch (err) {
    console.error('listFriends error', err);
    res.status(500).send('listFriends error');
  }
};

// list pending requests where 'to' is the username (only recipient should see it)
exports.listPending = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).send('username required');

    const friendships = db.collection('friendships');
    // only return pending docs where the user is a member and they did NOT initiate the request
    const pending = await friendships.find({ members: username, status: 'pending', actionBy: { $ne: username } }).toArray();
    // for a pending doc, find the other member
    const out = pending.map(p => ({
      from: p.actionBy, // actionBy was the sender
      members: p.members
    }));
    res.status(200).send({ ok: true, pending: out });
  } catch (err) {
    console.error('listPending error', err);
    res.status(500).send('listPending error');
  }
};

// search users by username (public search)
exports.searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.status(200).send({ ok: true, results: [] });

    const usersCollection = db.collection('users');
    // simple case-insensitive substring match
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const results = await usersCollection.find({ username: { $regex: regex } }).limit(50).toArray();
    // return sanitized user objects
    const out = results.map(u => ({ username: u.username, email: u.email || null, picture: u.picture || null }));
    res.status(200).send({ ok: true, results: out });
  } catch (err) {
    console.error('searchUsers error', err);
    res.status(500).send('searchUsers error');
  }
};
