module.exports = async (req, res) => {
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
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const data = JSON.parse(body);
    if (!data.file || !data.filename) {
      return res.status(400).json({ success: false, message: 'Invalid file data' });
    }

    return res.status(200).json({
      success: true,
      filename: data.filename,
      download_url: data.file
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
