const multer = require("multer");
const path = require("path");

// مكان تخزين الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images"); // الصور هتتخزن في فولدر images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // اسم فريد للصورة
  },
});

// فلترة الملفات (تسمح بالصور بس)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const images = multer({ storage, fileFilter });

module.exports = images;
