const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure the uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpe?g|png|webp/;
  const allowedMimeTypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (allowedExtensions.test(extname) && allowedMimeTypes.test(mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error("Only images (JPEG, PNG, WEBP) are allowed"), false); // Reject file
  }
};

// Multer upload instance
const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

// POST route for image upload
router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      const relativePath = `/uploads/${req.file.filename}`;
      res.status(200).send({
        message: "Image uploaded successfully",
        image: relativePath, // Return the relative path
      });
    } else {
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

module.exports = router;
