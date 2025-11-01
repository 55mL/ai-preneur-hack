const express = require('express');
const multer  = require('multer');
const path = require('path');
const fs = require("fs");
const fetch = require('node-fetch');             // ✳️ ต้องติดตั้ง: npm install node-fetch
const FormData = require('form-data');            // ✳️ ต้องติดตั้ง: npm install form-data

const app = express();
const PORT = 3000;

// สำหรับอ่าน body จาก form-data (multer ถือว่าใช้แล้ว)  
// หากต้องการอ่าน req.body.targetFolder ต้องแน่ใจว่า multer ถูกเรียกก่อน

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const targetFolder = req.body.targetFolder || "uploads/images";

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

app.use(express.static('.')); // serve index.html และไฟล์อื่น

// ✳️ แทนที่ endpoint /upload ด้วย /upload-and-ocr เพื่อรวม OCR
app.post('/upload-and-ocr', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path; // path ของไฟล์ที่อัพโหลด
    const targetFolder = req.body.targetFolder || "uploads/images";
    const keyText = req.body.keyText || ""; // สมมุติส่ง key มาด้วยชื่อ keyText

    // เตรียมไฟล์สำหรับส่งไป OCR
    const fileData = fs.readFileSync(filePath);
    const form = new FormData();
    form.append('model', 'typhoon-ocr');
    form.append('file', fileData, {
      filename: req.file.originalname
    });

    const apiKey = process.env.TYPHOON_OCR_API_KEY; // ตั้งค่าใน environment
    const response = await fetch('https://api.opentyphoon.ai/v1/ocr', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: form
    });

    const result = await response.json();
    const extractedText = result.text || result.markdown || ""; // ขึ้นกับ response ที่ได้

    // ตรวจจับ key
    const matched = extractedText.includes(keyText);

    // ส่งผล
    res.json({
      success: true,
      folder: targetFolder,
      filename: req.file.filename,
      extractedText,
      keyText,
      matched
    });

  } catch(err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
