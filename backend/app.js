require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;

const db = require("./db/mongodb");

const corsOptions = {
    origin: 'http://localhost:3001', // frontend dev server port
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Allow popups to communicate with the opener (fix Google OAuth postMessage COOP issue)
app.use((req, res, next) => {
  // Allow popups even when COOP is set — this lets google popup postMessage back to our page.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  // ensure we don't enable cross-origin embedder policy which can block messaging
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});

// Mount API routes
const routes = require('./routes');
app.use('/api', routes);

// Serve static frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// serve upload files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// SPA fallback
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Wait for DB then start server & socket.io
db.ready.then(() => {
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3001',
      methods: ['GET','POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    // join a user's room
    socket.on('join', (username) => {
      socket.join(username);
      console.log(`${socket.id} joined ${username}`);
    });

    // send message to target user
    socket.on('message', async ({ to, from, text }) => {
      const createdAt = new Date();
      // emit to recipient room
      io.to(to).emit('message', { from, text, createdAt });
      // persist message
      try {
        const messages = db.collection('messages');
        await messages.insertOne({ from, to, text, createdAt });
      } catch (err) {
        console.error('persist message error', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });

  // try to listen on PORT, fallback to PORT+1 if in use
  server.listen(PORT)
    .on('listening', () => console.log(`🚀 Server+IO running on port ${PORT}`))
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const alt = Number(PORT) + 1;
        server.listen(alt, () => console.log(`🚀 Server+IO running on fallback port ${alt}`));
      } else {
        console.error('Server error', err);
      }
    });
});

