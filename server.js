const uploadHandler = require('./api/upload');

module.exports = (req, res) => {
    // التوجيه إلى معالج الرفع في api/upload
    return uploadHandler(req, res);
};
