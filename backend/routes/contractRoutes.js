import express from "express";
import multer from "multer";
import Document from '../models/Document.js';
import { storeDocument } from "../controllers/uploadDocument.js";
import { verifyDocument, fetchDocument } from "../controllers/blockchain.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary file storage

// Upload and store document
router.post("/upload", upload.single("document"), async (req, res) => {
  const { uniqueID, documentHash, certificateType } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const response = await storeDocument(uniqueID, documentHash, file, certificateType);
    res.status(200).json({
      message: "Document uploaded and stored successfully",
      ...response,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify document
router.post("/verify", upload.single('document'), async (req, res) => {
  const { documentHash } = req.body;
  try {
    const isValid = await verifyDocument(documentHash);
    const document = await Document.findOne({ documentHash });
    if (isValid) {
      res.status(200).json({ message: "Document is valid" , isValid: true, ipfsLink: document.ipfsLink });
    } else {
      res.status(400).json({ message: "Document is invalid" , isValid: false});
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// fetch documents for individual dashboard
router.get('/:uniqueID', fetchDocument);

export default router;