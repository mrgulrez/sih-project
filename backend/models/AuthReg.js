// server/models/IssuingAuth.js
import mongoose from "mongoose";

const AuthRegSchema = new mongoose.Schema({
  organizationName: { type: String, required: true },
  officialEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["issuing-auth", "verifying-auth"],
    required: true, // Ensures that a role is provided during registration
  },
  organizationType: {
    type: String,
    enum: ["School", "University", "Employer", "Government Agency"],
    default: null, // Initially null, to be updated later
  },
  registrationNumber: { type: String, default: null }, // Initially null
  authorizedContactName: { type: String, default: null }, // Initially null
  contactNumber: { type: String, default: null }, // Initially null
  organizationAddress: {
    street: { type: String, default: null }, // Initially null
    city: { type: String, default: null }, // Initially null
    state: { type: String, default: null }, // Initially null
    postalCode: { type: String, default: null }, // Initially null
  },
  documents: [{ type: String, required: false }], // Store paths to uploaded documents
  status: { type: String, default: "pending" }, // default to 'pending'
  verificationToken: { type: String, required: false }, // Token for email verification
  verificationTokenExpires: { type: Date, required: false }, // Expiration time for the token
  isVerified: { type: Boolean, default: false }, // Flag to check if email is verified
  otp: { type: String, required: false }, // OTP for two-factor authentication
  otpExpires: { type: Date, required: false }, // Expiration time for the OTP
});

export default mongoose.model("AuthReg", AuthRegSchema);
