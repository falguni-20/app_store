const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    // Sanitize filename to remove special characters that might cause URL issues
    const sanitizedFilename = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')  // Replace spaces with hyphens
      .replace(/[^\w\-\.]+/g, ''); // Remove any non-word characters except hyphens and dots
    
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
