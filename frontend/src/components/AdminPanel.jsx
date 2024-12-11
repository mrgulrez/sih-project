// client/src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminPanel = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/requests"
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/requests/approve/${id}`
      );
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/admin/requests/reject/${id}`
      );
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl text-gray-900 text-center m-8">
        Admin Panel - Pending Requests
      </h2>
      {requests.length === 0 ? (
        <p className="text-center text-xl text-gray-600 m-8">No requests pending</p>
      ) : (
        <ul className="flex items-center justify-center text-gray-800">
          {requests.map((request) => (
            <li key={request._id} className="p-8 border rounded-lg shadow">
              <p>
                <strong>Name:</strong> {request.organizationName}
              </p>
              <p>
                <strong>Email:</strong> {request.officialEmail}
              </p>
              <p>
                <strong>Status:</strong> {request.status}
              </p>
              <div className="mt-2">
                <strong>Documents:</strong>
                <ul className="mt-1 space-y-2">
                  {request.documents &&
                    request.documents.map((document, index) => (
                      <li key={index}>
                        <a
                          href={`http://localhost:5000/uploads/${document}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          View Document {index + 1}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => handleApprove(request._id)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminPanel;
