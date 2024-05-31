const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
    cb(null, true);
};

const uploadExcel = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(xlsx|xls)$/)) {
            return cb(new Error('Only .xlsx, .xls format allowed!'));
        }
        cb(null, true);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});



module.exports = { upload, uploadExcel };
