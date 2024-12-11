import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Define the Admin Schema with email, password, and role fields
const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },  // Email field
  password: { type: String, required: true },  // Password field (hashed)
  role: { type: String, default: 'admin' }  // Role field with default value 'admin'
});

// Compare the entered password with the hashed password in the database
AdminSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Pre-save hook to hash the password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();  // Only hash password if it's modified

  // Hash the password before saving
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model('Admin', AdminSchema);
