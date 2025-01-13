const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "LymoraImages", // Folder name in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// POST route for image upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // Cloudinary returns the uploaded image details in `req.file`
    if (!req.file || !req.file.path) {
      return res.status(400).send({ message: "No image file provided" });
    }

    res.status(200).send({
      message: "Image uploaded successfully",
      imageUrl: req.file.path, // Cloudinary URL
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    res.status(500).send({ message: "Image upload failed", error });
  }
});

module.exports = router;
