import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Download, 
  Eye, 
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { jsPDF } from "jspdf";

const IndividualDocumentDashboard = () => {
  // State management
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Unique ID from local storage
  const uniqueID = localStorage.getItem("userUniqueID");

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `https://sih-project-xtmx.onrender.com/api/documents/${uniqueID}`
        );
        setDocuments(response.data);
        setFilteredDocuments(response.data);
        setIsLoading(false);
      } catch (error) {
        toast.error("Error fetching documents");
        setIsLoading(false);
      }
    };

    if (uniqueID) {
      fetchDocuments();
    }
  }, [uniqueID]);

  // Document view handler
  const handleViewDocument = (ipfsLink) => {
    if (ipfsLink) {
      try {
        const link = `https://${ipfsLink}`;
        window.open(link, "_blank", "noopener,noreferrer");
      } catch (error) {
        toast.error("Unable to open document");
      }
    } else {
      toast.error("Document link is not available");
    }
  };

  // Document download handler
  const handleDownloadDocument = async (certificateType, ipfsLink) => {
    if (!ipfsLink) {
      toast.error("Document link unavailable");
      return;
    }

    try {
      const link = `https://${ipfsLink}`;
      const response = await axios.get(link, { responseType: "arraybuffer" });
      const byteArray = new Uint8Array(response.data);

      const pdf = new jsPDF();
      pdf.addImage(byteArray, "JPEG", 10, 10, 180, 160);
      pdf.save(`${certificateType}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("Document downloaded successfully!");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  // Search and filter handler
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = documents.filter(doc => 
      doc.certificateType.toLowerCase().includes(term) &&
      (filterType === "all" || doc.status === filterType)
    );

    setFilteredDocuments(filtered);
  };

  // Filter handler
  const handleFilter = (status) => {
    setFilterType(status);

    const filtered = documents.filter(doc => 
      doc.certificateType.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (status === "all" || doc.status === status)
    );

    setFilteredDocuments(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />

      <div className="container mx-auto">
        <div className="bg-white shadow-md rounded-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold text-white">
                My Documents
              </h1>
              <div className="bg-white/20 text-white px-4 py-2 rounded-full">
                <span className="text-sm font-medium">ID: {uniqueID}</span>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="p-6 border-b">
            <div className="flex space-x-4">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="flex space-x-2">
                {["all", "verified", "pending"].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleFilter(status)}
                    className={`
                      px-4 py-2 rounded-lg capitalize 
                      ${filterType === status 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'}
                    `}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="mx-auto w-16 h-16 text-gray-300 mb-4" />
                <p>No documents found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <FileText className="text-blue-600 w-10 h-10" />
                      <div>
                        <h3 className="text-lg font-semibold">{doc.certificateType}</h3>
                        <p className="text-sm text-gray-600">
                          Issued: {new Date(doc.issuedDate).toLocaleDateString()}
                        </p>
                        <span 
                          className={`
                            inline-block px-2 py-1 rounded-full text-xs mt-1
                            ${doc.status === 'verified' 
                              ? 'bg-green-200 text-green-800' 
                              : 'bg-yellow-200 text-yellow-800'}
                          `}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDocument(doc.ipfsLink)}
                        className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                        title="View Document"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc.certificateType, doc.ipfsLink)}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
                        title="Download Document"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualDocumentDashboard;
