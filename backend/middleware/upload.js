const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Create upload directories if they don't exist
const uploadsDir = path.join(__dirname, "../uploads");
const assignmentsDir = path.join(uploadsDir, "assignments");
const submissionsDir = path.join(uploadsDir, "submissions");

[uploadsDir, assignmentsDir, submissionsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.path.includes("Submit") ? "submissions" : "assignments";
    cb(null, path.join(uploadsDir, uploadType));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, name + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedExt = /pdf|doc|docx|txt|xlsx|pptx|jpg|jpeg|png|zip|rar/i;
    const ext = path.extname(file.originalname);

    if (allowedExt.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only documents and images are allowed."));
    }
  },
});

module.exports = upload;
