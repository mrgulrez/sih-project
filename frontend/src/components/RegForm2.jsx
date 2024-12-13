import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaBuilding, FaUserTie, FaPhone,  FaFileAlt, FaRegCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Form2 = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get("userID");
  const navigate = useNavigate();

  const [organizationType, setOrganizationType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [authorizedContactName, setAuthorizedContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [documents, setDocuments] = useState([]);

  // Handle file input change
  const handleFileChange = (e) => {
    setDocuments([...e.target.files]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("userID", userID);
    formData.append("organizationType", organizationType);
    formData.append("registrationNumber", registrationNumber);
    formData.append("authorizedContactName", authorizedContactName);
    formData.append("contactNumber", contactNumber);
    formData.append("organizationAddress", JSON.stringify(organizationAddress));

    documents.forEach((file) => {
      formData.append("documents", file);
    });

    try {
      await axios.post("https://sih-project-xtmx.onrender.com/api/auth/update-details", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Details updated successfully! Registration request submitted.");
      window.location.reload();
      navigate("/");
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 via-white to-pink-100">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <h2 className="text-3xl text-center text-violet-700 font-semibold mb-8">
          Complete Your Registration
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Organization Type */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">Organization Type</label>
              <div className="flex items-center border-b-2 border-gray-300 pb-3">
                <FaBuilding className="text-blue-600 mr-3" />
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  required
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Organization Type</option>
                  <option value="School">School</option>
                  <option value="University">University</option>
                  <option value="Employer">Employer</option>
                  <option value="Government Agency">Government Agency</option>
                </select>
              </div>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">Registration Number</label>
              <div className="flex items-center border-b-2 border-gray-300 pb-3">
                <FaRegCheckCircle className="text-blue-600 mr-3" />
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                  placeholder="Enter Registration Number"
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Authorized Contact Name */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">Authorized Contact Name</label>
              <div className="flex items-center border-b-2 border-gray-300 pb-3">
                <FaUserTie className="text-blue-600 mr-3" />
                <input
                  type="text"
                  value={authorizedContactName}
                  onChange={(e) => setAuthorizedContactName(e.target.value)}
                  required
                  placeholder="Enter Contact Name"
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">Contact Number</label>
              <div className="flex items-center border-b-2 border-gray-300 pb-3">
                <FaPhone className="text-blue-600 mr-3" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                  placeholder="Enter Contact Number"
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Organization Address */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">Organization Address</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street"
                  value={organizationAddress.street}
                  onChange={(e) =>
                    setOrganizationAddress({ ...organizationAddress, street: e.target.value })
                  }
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={organizationAddress.city}
                  onChange={(e) =>
                    setOrganizationAddress({ ...organizationAddress, city: e.target.value })
                  }
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={organizationAddress.state}
                  onChange={(e) =>
                    setOrganizationAddress({ ...organizationAddress, state: e.target.value })
                  }
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={organizationAddress.postalCode}
                  onChange={(e) =>
                    setOrganizationAddress({ ...organizationAddress, postalCode: e.target.value })
                  }
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-b-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Upload Organization Registration Certificate */}
            <div className="space-y-2">
              <label className="block text-sm text-gray-600 font-medium">
                Upload Organization Registration Certificate
              </label>
              <div className="flex items-center border-b-2 border-gray-300 pb-3">
                <FaFileAlt className="text-blue-600 mr-3" />
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  required
                  className="w-full p-3 text-sm text-gray-700 bg-gray-50 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Please upload a valid organization registration certificate (PDF, JPG, PNG).
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="col-span-2 text-center">
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form2;
