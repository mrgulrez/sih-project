// server/controllers/adminController.js
import AuthReg from "../models/AuthReg.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Fetch all pending requests from the AuthReg model
export const getPendingRequests = async (req, res) => {
  try {
    const pendingRequests = await AuthReg.find({ status: "pending", isVerified: true });

    // Adding a type field based on the role (issuing-auth or verifying-auth)
    const combinedRequests = pendingRequests.map((request) => ({
      ...request._doc,
      type: request.role === "issuing-auth" ? "issuing" : "verifying", // Identifying the type based on role
    }));

    res.status(200).json(combinedRequests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching requests", error: error.message });
  }
};

// Approve a request (register the authority in the same model)
export const approveRequest = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the request in AuthReg model
    const request = await AuthReg.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Update the status to 'approved'
    await AuthReg.findByIdAndUpdate(id, { status: "approved" });

    // Return appropriate message based on the role
    const responseMessage =
      request.role === "issuing-auth"
        ? "Request approved and user registered as Issuing Authority"
        : "Request approved and user registered as Verifying Authority";

    res.status(200).json({
      message: responseMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving request", error: error.message });
  }
};

// Reject a request (delete the entry from AuthReg)
export const rejectRequest = async (req, res) => {
  const { id } = req.params;
  try {
    // Find the request in AuthReg model
    const request = await AuthReg.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Delete the request
    await AuthReg.findByIdAndDelete(id);

    // Return appropriate message based on the role
    const responseMessage =
      request.role === "issuing-auth"
        ? "Request rejected and entry deleted (Issuing Authority)"
        : "Request rejected and entry deleted (Verifying Authority)";

    res.status(200).json({
      message: responseMessage,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting request", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { officialEmail, password } = req.body; // assuming you're sending these in the body
  try {
    const admin = await Admin.findOne({ email: officialEmail });

    //const hashedPassword = await bcrypt.hash(password, 10);
   // console.log(hashedPassword);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      const token = jwt.sign(
        { id: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      // Send success response with token
      return res
        .status(200)
        .json({
          message: "Login successful",
          token,
          redirectUrl: "/admin-dashboard",
          role: "admin"
        });
    } else {
      return res.status(400).json({ message: "Incorrect password" });
    }
  } catch (error) {
    console.error("Error logging in admin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
