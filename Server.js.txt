const multer = require('multer');

// استخدام الذاكرة لتخزين الملف مؤقتاً في Vercel Serverless
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
  // تفعيل CORS للتواصل من أي مكان
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await runMiddleware(req, res, upload.single('file'));

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // تحويل الملف إلى Base64 Data URL للتحميل المباشر والسهل بدون حاجة لهارد ديسك دائم
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
