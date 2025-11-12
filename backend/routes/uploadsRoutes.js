const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1e9);
    cb(null, unique + '-' + file.originalname.replace(/\s+/g,'_'));
  }
});
const upload = multer({ storage });

router.post('/', upload.array('files', 6), (req, res) => {
  const files = (req.files || []).map(f => ({ filename: f.filename, url: `/uploads/${f.filename}` }));
  res.status(200).send({ ok: true, files });
});

module.exports = router;
