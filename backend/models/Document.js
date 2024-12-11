// Backend (DocumentSchema with certificateType)
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  uniqueID: { type: String, required: true },
  documentHash: { type: String, required: true },
  ipfsLink: { type: String, required: true },
  certificateType: { type: String, required: true }, // Add certificateType field
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Document", DocumentSchema);