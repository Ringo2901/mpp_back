const {join} = require("node:path");
require('dotenv').config();

module.exports = {
    uploadDir: join(__dirname, '../uploads'),
};
