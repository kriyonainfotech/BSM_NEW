const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Import CloudinaryStorage from multer-storage-cloudinary
const cloudinary = require("../config/cloudinaryConfig");
const {
  AddProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductByUser,
} = require("../controllers/productController");

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Cloudinary instance
  params: {
    folder: "products", // Folder in Cloudinary where images will be stored
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // Allowed image formats
  },
});

// Set up multer with Cloudinary storage
const upload = multer({ storage: storage });

// Routes
router.post("/AddProduct", upload.single("image"), AddProduct);
router.get("/getAllProducts", getAllProducts);
router.post("/getProductById", getProductById);
router.post("/updateProduct", upload.single("image"), updateProduct);
router.delete("/deleteProduct", deleteProduct);
router.post("/getProductByUser", getProductByUser);

module.exports = router;
