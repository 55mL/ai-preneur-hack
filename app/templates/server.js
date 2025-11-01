const express = require('express');
const multer  = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// กำหนดโฟลเดอร์ที่จะเก็บไฟล์
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

app.use(express.static('.')); // ให้ serve index.html และไฟล์อื่น

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});