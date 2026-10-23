module.exports = async (req, res) => {
  // إعدادات CORS للسماح بالاتصال من أي مكان
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).send('API File Upload Server is Live!');
  }

  try {
    // قراءة البيانات المرسلة مباشرة كـ Buffer
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const rawData = Buffer.concat(buffers);

    if (!rawData || rawData.length === 0) {
      return res.status(400).json({ success: false, message: 'No file uploaded or empty body' });
    }

    // توليد اسم افتراضي وحجم للملف واستخراج نوعه
    const filename = req.headers['x-file-name'] || `file_${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    
    const base64Data = rawData.toString('base64');
    const downloadUrl = `data:${contentType};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      filename: filename,
      download_url: downloadUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
