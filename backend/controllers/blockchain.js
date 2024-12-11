import { ethers } from "ethers";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Document from '../models/Document.js';

dotenv.config();

// Get the current directory path using 'import.meta.url'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fetch the contract ABI from the compiled contract JSON
const contractABI = JSON.parse(
  fs
    .readFileSync(
      path.join(
        __dirname,
        "../artifacts/contracts/DocumentVerification.sol/DocumentVerification.json"
      )
    )
    .toString()
);

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL); // Add your RPC URL
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new ethers.Contract(contractAddress, contractABI.abi, wallet);

const gasPrice = await provider.getGasPrice();
console.log("Current Gas Price: ", ethers.utils.formatUnits(gasPrice, "gwei"));

// Function to store a document on the blockchain
export const storeDocumentt = async (uniqueID, documentHash) => {
  try {
    const estimatedGas = await contract.estimateGas.storeDocument(
      uniqueID,
      documentHash
    );
    console.log(
      "Estimated Gas: ",
      ethers.utils.formatUnits(estimatedGas, "gwei")
    );
    // Send the transaction to store the document with dynamic gas price
    const tx = await contract.storeDocument(uniqueID, documentHash, {
      gasPrice: gasPrice,
      gasLimit: 200000, // Set gas limit (increase if the function is more complex)
    });

    // Wait for the transaction to be mined
    console.log("Transaction sent. Waiting for confirmation...");

    // Wait for the transaction to be mined
    const receipt = await tx.wait();

    // Log the gas used for the transaction
    console.log("Gas Used: ", receipt.gasUsed.toString()); // This gives the amount of gas used
    console.log("Transaction Hash: ", receipt.transactionHash); // This gives the transaction hash
    return tx.hash; // Return the transaction hash
  } catch (error) {
    console.error("Error storing document:", error);
    throw new Error("Error storing document");
  }
};

// Function to verify a document on the blockchain
export const verifyDocument = async (documentHash) => {
  try {
    const isValid = await contract.verifyDocument(documentHash);
    return isValid;
  } catch (error) {
    console.error("Error verifying document:", error);
    throw new Error("Error verifying document");
  }
};

export const fetchDocument = async (req, res) => {
  const { uniqueID } = req.params;

  try {
    const documents = await Document.find({ uniqueID });  // Find documents by uniqueID
    if (!documents) {
      return res.status(404).json({ message: 'No documents found for this unique ID' });
    }

    res.status(200).json(documents);  // Return the list of documents
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};