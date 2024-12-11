import mongoose from 'mongoose';

const indRegSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  officialEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uniqueID: { type: String, required: true, unique: true },
  verificationToken: { type: String },
  isVerified: { type: Boolean, default: false },
  status: { type: String, default: 'pending' },  // Status: pending until email is verified
});

export default mongoose.model('IndReg', indRegSchema);
