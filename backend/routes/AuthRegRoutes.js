// server/routes/issuingAuthRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { sendVerificationEmail, verifyEmail, updateUserDetails, login } from '../controllers/AuthRegController.js';

const router = express.Router();

// Define `__dirname` equivalent for ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path for the uploads folder
const uploadPath = path.join(__dirname, '..', 'uploads');

// Ensure the uploads folder exists; if not, create it
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer storage to retain the original file extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Use the absolute path for the uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Set up multer with the storage configuration for multiple files
const upload = multer({ storage });

// Routes for email verification, registration, and uploading documents
router.post('/register', sendVerificationEmail);
router.get('/verify-email', verifyEmail); 
router.post('/update-details', upload.array('documents', 10), updateUserDetails); 
router.post('/login/:userType', login);
export default router;
