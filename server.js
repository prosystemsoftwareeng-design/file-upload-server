// ذاكرة مؤقتة لتخزين الملفات بالمعرفات المختصرة
const fileStore = new Map();

module.exports = async (req, res) => {
  // إعدادات CORS
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

  const host = req.headers.host || 'file-upload-server-eight.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${protocol}://${host}`;

  // مسار التنزيل المباشر المختصر: GET /download/:fileId
  if (req.method === 'GET' && req.url.startsWith('/download/')) {
    const fileId = req.url.split('/download/')[1];
    const storedFile = fileStore.get(fileId);

    if (!storedFile) {
      return res.status(404).send('عذراً، الملف غير موجود أو انتهت صلاحية الجلسة.');
    }

    const fileBuffer = Buffer.from(storedFile.data, 'base64');
    
    // إرسال الترويسات كملف تنزيل مباشر
    res.setHeader('Content-Type', storedFile.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(storedFile.filename)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    return res.status(200).end(fileBuffer);
  }

  if (req.method !== 'POST') {
    return res.status(200).send('API File Upload Server is Live!');
  }

  // مسار رفع الملف عبر POST
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const data = JSON.parse(body);
    if (!data.file || !data.filename) {
      return res.status(400).json({ success: false, message: 'بيانات الملف غير مكتملة' });
    }

    // استخراج بيانات Base64 ونوع الملف
    const matches = data.file.match(/^data:(.+);base64,(.+)$/);
    let contentType = 'application/octet-stream';
    let base64Content = data.file;

    if (matches && matches.length === 3) {
      contentType = matches[1];
      base64Content = matches[2];
    }

    // توليد ID مختصر فريد للملف
    const fileId = 'f_' + Math.random().toString(36).substring(2, 9);

    // حفظ الملف في الذاكرة
    fileStore.set(fileId, {
      filename: data.filename,
      contentType: contentType,
      data: base64Content
    });

    // رابط التنزيل المباشر المختصر
    const directDownloadUrl = `${baseUrl}/download/${fileId}`;

    return res.status(200).json({
      success: true,
      file_id: fileId,
      filename: data.filename,
      download_url: directDownloadUrl
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
