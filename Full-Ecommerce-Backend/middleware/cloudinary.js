const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "my-app", // ممكن تغيره حسب المشروع
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const parser = multer({ storage });

module.exports = parser;
