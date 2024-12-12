import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import IndReg from "../models/IndReg.js"; // Assuming you have this model for individual registration

// Function to generate unique ID
const generateUniqueID = () => {
  return `DL${Math.floor(Math.random() * 10000)}`; // Generate ID like "DL324324"
};

// Register individual
export const registerIndividual = async (req, res) => {
  const { name, dob, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await IndReg.findOne({ officialEmail: email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique ID
    const uniqueID = generateUniqueID();

    // Generate verification token
    const verificationToken = jwt.sign(
      { officialEmail: email, uniqueID, role: "individual" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save the user with status as "pending" until verified
    const newUser = new IndReg({
      name,
      dob,
      officialEmail: email,
      password: hashedPassword,
      uniqueID,
      verificationToken,
      isVerified: false,
      status: "pending",
      role: "individual",
    });

    await newUser.save();

    // Send verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    });

    res
      .status(200)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

export const login = async (req, res) => {
  const { officialEmail, password } = req.body;

  try {
    // Find the individual user by email
    const user = await IndReg.findOne({ officialEmail });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid credentials: User not found" });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res
        .status(400)
        .json({
          message:
            "Registration request not approved yet. Please verify your email.",
        });
    }

    // Compare password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Invalid credentials: Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, officialEmail: user.officialEmail, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Send success response with the token and redirect URL
    res.status(200).json({
      message: "Login successful",
      redirectUrl: `/individual-dashboard/${user.uniqueID}`, // Redirect to individual dashboard using uniqueID
      token, // Include the token in the response
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
