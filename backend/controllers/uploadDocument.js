import nodemailer from "nodemailer";
import { storeDocumentt } from "./blockchain.js";
import Document from "../models/Document.js";
import User from "../models/IndReg.js"; // Assuming you have a User model to fetch user info by uniqueID
import { PinataSDK } from "pinata-web3";
import fs from "fs";


// Initialize Pinata SDK
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.GATEWAY_URL,
});

// Upload file to IPFS
export async function uploadToIPFS(file) {
  try {
    const blob = new Blob([fs.readFileSync(file.path)]);
    const fileToUpload = new File([blob], file.originalname, {
      type: file.mimetype,
    });

    const uploadResponse = await pinata.upload.file(fileToUpload);
    return `${process.env.GATEWAY_URL}/ipfs/${uploadResponse.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS:", error.message);
    throw new Error("IPFS upload failed");
  }
}

// Store document in MongoDB and Blockchain
export async function storeDocument(
  uniqueID,
  documentHash,
  file,
  certificateType
) {
  try {
    // Upload file to IPFS
    const ipfsLink = await uploadToIPFS(file);
    console.log(ipfsLink);

    // Store on blockchain
    const txHash = await storeDocumentt(uniqueID, documentHash);

    // Save metadata in MongoDB
    const document = new Document({
      uniqueID,
      documentHash,
      ipfsLink,
      certificateType,
      timestamp: new Date().toISOString(),
    });
    await document.save();

    // Get the user details using uniqueID
    const user = await User.findOne({ uniqueID });

    if (user && user.officialEmail) {
      // Send email to user
      sendConfirmationEmail(user.officialEmail, ipfsLink, certificateType);
    }

    return { transactionHash: txHash, ipfsLink };
  } catch (error) {
    console.error("Error storing document:", error.message);
    throw new Error("Document storage failed");
  }
}

// Send email to user after document is stored
async function sendConfirmationEmail(userEmail, ipfsLink, certificateType) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `Your Document: ${certificateType} has been stored securely on Blockchain`,
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: 0 auto;">
  
        <!-- Email Body -->
        <div style="padding: 20px;">
          <p style="font-size: 16px; color: #333;">Hello,</p>
          <p style="font-size: 16px; color: #333;">Your document of type "<strong>${certificateType}</strong>" has been successfully stored on the blockchain and is now securely accessible.</p>
          <p style="font-size: 16px; color: #333;">You can view the document by clicking the link below:</p>
  
          <!-- Button Link -->
          <a href="${ipfsLink}" target="_blank" style="text-decoration: none;">
            <button style="background-color: #4CAF50; color: white; padding: 12px 20px; font-size: 16px; border: none; cursor: pointer; border-radius: 5px;">
              View Document
            </button>
          </a>
  
          <p style="font-size: 16px; color: #333;">If you have any questions, feel free to contact us.</p>
        </div>
  
        <!-- Footer -->
        <div style="background-color: #f4f4f4; padding: 20px; border-top: 1px solid #ddd;">
          <p style="font-size: 14px; color: #555;">&copy; 2024 DocLedger. All rights reserved.</p>
          <p style="font-size: 14px; color: #555;">
            <a href="https://example.com/privacy-policy" target="_blank" style="color: #4CAF50; text-decoration: none;">Privacy Policy</a> |
            <a href="https://example.com/terms" target="_blank" style="color: #4CAF50; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Email sending failed");
  }
}