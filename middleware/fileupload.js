const multer = require("multer");
const path = require("path");

// Function to filter only image files
const imageFilter = function (req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const LogoImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/LogoImages/"); // Destination folder for storing uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    const imagePath = file.fieldname + "-" + uniqueSuffix + originalExtension;
    cb(null, imagePath);
  },
});
// Function to filter allowed PDF file types
const pdfFilter = function (req, file, cb) {
  // Check if the file extension is .pdf
  if (!file.originalname.match(/\.(pdf)$/i)) {
    // Return an error if the file is not a PDF
    return cb(new Error("Only PDF files are allowed!"), false);
  }
  // Accept the file if it's a PDF
  cb(null, true);
};

// Configure storage for company profile PDF files
const CompanyProfileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the destination folder for storing uploaded PDFs
    cb(null, "uploads/CompanyProfile/");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename for the uploaded PDF
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Get the original file extension
    const originalExtension = path.extname(file.originalname);
    // Construct the filename using the fieldname, unique suffix, and original extension
    const filename = file.fieldname + "-" + uniqueSuffix + originalExtension;
    // Provide the generated filename to multer
    cb(null, filename);
  },
});

// Initialize multer instance for logo images
const uploadLogoImage = multer({
  storage: LogoImageStorage,
  fileFilter: imageFilter,
});

// Initialize multer instance for company profile PDF files
const uploadCompanyProfile = multer({
  storage: CompanyProfileStorage,
  fileFilter: pdfFilter,
});

const productImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/ProductImages/"); // Destination folder for storing product images
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalExtension = path.extname(file.originalname);
    const imageName = "product-" + uniqueSuffix + originalExtension;
    cb(null, imageName);
  },
});

// Initialize multer instance for product images
const uploadProductImage = multer({
  storage: productImageStorage,
  fileFilter: imageFilter,
});

module.exports = { uploadLogoImage, uploadCompanyProfile, uploadProductImage };
