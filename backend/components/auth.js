const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db/mongodb');
const router = require('../routes');

// JWT secret keys (in real apps, store in environment variables)
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Access token: short-lived (15 min), Refresh token: long-lived (7 days)
const ACCESS_EXPIRY = '15m';
const REFRESH_EXPIRY = '7d';

exports.registerUser = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).send('username and password required');

    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser)
      return res.status(400).send('user already exists');

    const hashed = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ username, password: hashed });

    // issue tokens on registration
    const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });

    await usersCollection.updateOne({ username }, { $set: { refreshToken } });

    res.status(200).send({ ok: true, accessToken, refreshToken, user: { username } });
  } catch (err) {
    console.error('Error in registerUser:', err);
    res.status(500).send('Error in registerUser');
  }
};

exports.loginCredentials = async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).send('username and password required');

    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).send('invalid credentials');

    const accessToken = jwt.sign({ username }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = jwt.sign({ username }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });

    // store refresh token in DB
    await usersCollection.updateOne(
      { username },
      { $set: { refreshToken } }
    );

    res.status(200).send({ ok: true, accessToken, refreshToken, user: { username } });
  } catch (err) {
    console.error('Error in loginCredentials:', err);
    res.status(500).send('Error in loginCredentials');
  }
};

exports.loginGmail = async (req, res) => {
  try {
    // payload received from frontend GoogleLogin component
    // Accept either the google credential object or flat fields
    const { credential } = req.body || {};
    const usersCollection = db.collection('users');

    let payload = null;
    if (credential) {
      // Verify the ID token with Google's tokeninfo endpoint
      try {
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (!tokenInfoRes.ok) {
          const txt = await tokenInfoRes.text();
          console.warn('tokeninfo failed', tokenInfoRes.status, txt);
        } else {
          payload = await tokenInfoRes.json();
        }
      } catch (err) {
        console.warn('google tokeninfo fetch error', err);
      }
    }

    // fallback: if no payload derived, try to accept flat fields on body
    if (!payload) {
      const { email, name, picture, sub } = req.body || {};
      payload = { email, name, picture, sub };
    }

    const username = (payload && (payload.email || payload.name || payload.sub)) || null;
    if (!username) return res.status(400).send('could not determine google user');

    // normalize username to an email-like or unique id
    const finalUsername = payload.email || `google_${payload.sub}`;

    let user = await usersCollection.findOne({ username: finalUsername });
    if (!user) {
      user = { username: finalUsername, email: payload.email, picture: payload.picture, type: 'google', createdAt: new Date() };
      await usersCollection.insertOne(user);
    }

    const accessToken = jwt.sign({ username: finalUsername }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = jwt.sign({ username: finalUsername }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRY });

    await usersCollection.updateOne({ username: finalUsername }, { $set: { refreshToken } });

    res.status(200).send({ ok: true, accessToken, refreshToken, user });
  } catch (err) {
    console.error('Error in loginGmail:', err);
    res.status(500).send('Error in loginGmail');
  }
};

exports.refreshToken = async (req, res) => {
  try {
    console.log('entered, refresh token function');
    // accept refresh token from body or cookie
    const refreshToken = (req.body && req.body.refreshToken) || (req.cookies && req.cookies.refreshToken) || null;
    if (!refreshToken) return res.status(401).send('refresh token required');

    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ refreshToken });
    if (!user) return res.status(403).send('invalid refresh token');

    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).send('invalid or expired refresh token');

      const accessToken = jwt.sign({ username: decoded.username, email: decoded.email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRY });
      res.status(200).send({ ok: true, accessToken });
    });
  } catch (err) {
    console.error('Error in refreshToken:', err);
    res.status(500).send('Error in refreshToken');
  }
};

exports.testing = (req,res) => {
    console.log("testing success");
    res.status(200).send('testing success');
}

// update profile fields (e.g., picture)
exports.updateProfile = async (req, res) => {
  try {
    const { username, picture } = req.body || {};
    if (!username) return res.status(400).send('username required');
    const usersCollection = db.collection('users');
    await usersCollection.updateOne({ username }, { $set: { picture } }, { upsert: false });
    const user = await usersCollection.findOne({ username });
    res.status(200).send({ ok: true, user });
  } catch (err) {
    console.error('updateProfile error', err);
    res.status(500).send('updateProfile error');
  }
};
