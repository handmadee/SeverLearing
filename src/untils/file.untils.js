'use strict';
const fs = require('fs');


const delFile = (path) => {
    return fs.unlinkSync(path);
}

module.exports = { delFile }