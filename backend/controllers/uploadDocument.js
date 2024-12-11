import { PinataSDK } from "pinata-web3";
import fs from "fs";
import { storeDocumentt } from "./blockchain.js";
import Document from "../models/Document.js";

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
export async function storeDocument(uniqueID, documentHash, file, certificateType) {
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

    return { transactionHash: txHash, ipfsLink };
  } catch (error) {
    console.error("Error storing document:", error.message);
    throw new Error("Document storage failed");
  }
}
