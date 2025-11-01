const express = require('express');
const multer  = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// กำหนดโฟลเดอร์ที่จะเก็บไฟล์
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const targetFolder = req.body.targetFolder || "uploads/images";

    // ถ้าโฟลเดอร์ยังไม่มี ให้สร้าง
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    cb(null, targetFolder);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
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