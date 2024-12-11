import AuthReg from "../models/AuthReg.js";
import IndReg from "../models/IndReg.js";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Send verification email after user registration
export const sendVerificationEmail = async (req, res) => {
  const { organizationName, officialEmail, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await AuthReg.findOne({ officialEmail });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const token = jwt.sign({ officialEmail }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // Set an expiration time for the token (1 hour)
    const verificationTokenExpires = new Date(Date.now() + 3600 * 1000); // 1 hour from now

    // Save user with initial details (most fields are null until verified)
    const newUser = new AuthReg({
      organizationName,
      officialEmail,
      password: hashedPassword,
      role,
      verificationToken: token,
      verificationTokenExpires: verificationTokenExpires,
      isVerified: false, // Not verified until email is confirmed
    });

    await newUser.save();

    // Send the verification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const verificationUrl = `https://sih-hack-a7xz.onrender.com/verify-email?token=${token}`;
   // const verificationUrl = `http://localhost:5173/verify-email?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: officialEmail,
      subject: "Verify Your Email",
      html: `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`,
    });

    res
      .status(200)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded)

    // Check if the decoded token contains necessary info like officialEmail and role
    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }

    // Define an array of models to search
    const models = [AuthReg, IndReg];

    let user = null;

    // Use a for loop to check both models
    for (let i = 0; i < models.length; i++) {
      user = await models[i].findOne({
        officialEmail: decoded.officialEmail,
        verificationToken: token,
      });

      if (user) {
        break; // Stop searching once the user is found
      }
    }

    // If no user is found, return an error
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined; // Remove the verification token after successful verification
    await user.save();

    // Send success response with the appropriate redirect URL
    res.status(200).json({
      message: "Email verified successfully.",
      redirectUrl:
        decoded.role === "individual"
          ? "/"
          : `/complete-reg?userID=${user._id}`,
    });
  } catch (error) {
    console.error("Error during verification:", error);
    res
      .status(500)
      .json({ message: "Error verifying email", error: error.message });
  }
};

// Handle file upload for documents and other details update
export const updateUserDetails = async (req, res) => {
  const {
    userID,
    organizationType,
    registrationNumber,
    authorizedContactName,
    contactNumber,
    organizationAddress,
  } = req.body;

  const documents = req.files.map((file) => file.filename); // Store file paths

  try {
    const user = await AuthReg.findOne({ _id: userID });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // Update user details with the new information and documents
    user.organizationType = organizationType;
    user.registrationNumber = registrationNumber;
    user.authorizedContactName = authorizedContactName;
    user.contactNumber = contactNumber;
    user.organizationAddress = JSON.parse(organizationAddress);
    user.documents = [...user.documents, ...documents];

    await user.save();

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user details", error: error.message });
  }
};

export const login = async (req, res) => {
  const { officialEmail, password } = req.body;
  const { userType } = req.params; // Get userType from URL params

  try {
    // Find the user in the AuthReg collection based on the email and userType
    const user = await AuthReg.findOne({ officialEmail, role: userType });

    if (!user) {
      return res.status(400).json({
        message: "User not found or incorrect user type",
        status: null,
      });
    }

    // Check if the user status is approved
    if (user.status !== "approved") {
      return res.status(400).json({
        message: "Registration request not approved yet",
        status: user.status,
        userID: user._id,
      });
    }

    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, officialEmail: user.officialEmail },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h", // Token expires in 1 hour
      }
    );

    // Send success response and redirect URL based on the user type
    res.status(200).json({
      message: "Login successful",
      redirectUrl: `/${userType}-dashboard`, // Redirect based on user type (admin, issuing-auth, etc.)
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};