const configCloudinary = require('./../configs/config.cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

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

const storageCloud = new CloudinaryStorage({
    cloudinary: configCloudinary,
    params: {
        folder: 'uploads',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
            { width: 2000, height: 2000, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' }
        ]
    },
    cleanup: {
        folder: 'uploads',
        enabled: true
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
    storage: storageCloud,
    fileFilter: fileFilter
});



module.exports = { upload, uploadExcel };
