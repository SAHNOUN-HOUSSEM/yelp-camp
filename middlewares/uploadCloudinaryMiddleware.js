const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('../cloudinary/config');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'YelpCamp'
    },
});

const upload = multer({ storage: storage });

module.exports = upload