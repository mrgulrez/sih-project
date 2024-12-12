import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast"; // For notifications
import { jsPDF } from "jspdf"; // Import jsPDF for PDF generation

const IndividualDashboard = () => {
  const uniqueID = localStorage.getItem("userUniqueID");
  const [documents, setDocuments] = useState([]); // Store documents data
  const [message, setMessage] = useState(""); // Message for notifications

  // Fetch documents associated with the uniqueID
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/documents/${uniqueID}`
        );
        setDocuments(response.data); // Set the fetched documents
      } catch (error) {
        setMessage("Error fetching documents");
        toast.error("Error fetching documents");
      }
    };
    fetchDocuments();
  }, [uniqueID]);

  // Function to handle the document viewing process
  const handleViewDocument = (ipfsLink) => {
    if (ipfsLink) {
      const link = `https:/${ipfsLink}`;
      window.open(link, "_blank"); // Open the IPFS link in a new tab
    } else {
      toast.error("IPFS link not available");
    }
  };

  const handleDownloadDocument = (certificateType, ipfsLink) => {
    if (ipfsLink) {
      const link = `https://${ipfsLink}`;

      axios
        .get(link, { responseType: "arraybuffer" })
        .then((response) => {
          const byteArray = new Uint8Array(response.data);
          const base64Image = arrayBufferToBase64(byteArray); // Convert byteArray to base64

          const pdf = new jsPDF();
          pdf.addImage(byteArray, "JPEG", 10, 10, 180, 160); // Add image to PDF
          pdf.save(`${certificateType}.pdf`);
        })
        .catch((error) => {
          console.error("Error downloading document", error);
        });
    }
  };

  // Convert the array buffer to a base64 string for images
  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = "";
    let bytes = new Uint8Array(arrayBuffer);
    let length = bytes.byteLength;

    for (let i = 0; i < length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary); // Convert binary data to base64
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl text-rose-950 font-light">
            Documents Issued
          </h2>
          <span className="text-lg text-gray-600">{uniqueID}</span>{" "}
          {/* Display Unique ID */}
        </div>

        {/* Display list of documents */}
        <div className="space-y-4">
          {documents.length === 0 ? (
            <p>No documents available for this unique ID.</p>
          ) : (
            documents.map((doc, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-sm text-gray-800">
                  {index + 1}. {doc.certificateType}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleViewDocument(doc.ipfsLink)}
                    className="bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700"
                  >
                    View Document
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadDocument(doc.certificateType, doc.ipfsLink)
                    }
                    className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
                  >
                    Download Document
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {message && <p className="mt-4 text-center text-blue-700">{message}</p>}
      </div>
    </div>
  );
};

export default IndividualDashboard;
