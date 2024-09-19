const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/config');

exports.deleteFile = (filename) => {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};
