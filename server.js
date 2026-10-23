const multer = require('multer');

// استخدام الذاكرة المؤقتة لتخزين الملفات في Vercel
const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

module.exports = async (req, res) => {
  // إعدادات CORS للسماح بالاتصال من Access ومن أي مكان
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).send('API File Upload Server is Live!');
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // تحويل الملف إلى Base64 Data URL لتوليد رابط تنزيل مباشر
    const mimeType = req.file.mimetype || 'application/octet-stream';
    const base64Data = req.file.buffer.toString('base64');
    const downloadUrl = `data:${mimeType};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      filename: req.file.originalname,
      download_url: downloadUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
