// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const sharp = require('sharp');
// const cloudinary = require('cloudinary').v2;
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const { addcardimage } = require('../controllers/imagecardController');

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Multer Cloudinary storage configuration
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'card', // Folder in Cloudinary where images will be stored
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//   },
// });

// // Define the multer upload handler
// const upload = multer({ storage: storage });

// // Using upload.fields() to handle multiple files
// router.post('/addimagecard',
//   upload.fields([{ name: 'bgImageUrl', maxCount: 1 }, { name: 'profilePicUrl', maxCount: 1 }]),
//   addcardimage
// );

// module.exports = router;
