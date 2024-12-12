import React, { useState, useRef } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import JSZip from 'jszip';
import { 
  FileCheck, 
  FileX, 
  FileArchive, 
  Upload, 
  EyeIcon, 
  DownloadCloud 
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyDash = () => {
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verifiedDocuments, setVerifiedDocuments] = useState([]);
  const [failedDocuments, setFailedDocuments] = useState([]);
  const fileInputRef = useRef(null);

  // Validate filename format
  const validateFileName = (fileName) => {
    // Get the base filename without path
    const baseFileName = fileName.split(/[/\\]/).pop();
    
    // Regex to check if filename matches the format: UniqueID_CertificateType
    const fileNameRegex = /^[A-Z]{2}\d{4}_[A-Za-z\s-]+\.[a-zA-Z0-9]+$/;
    return fileNameRegex.test(baseFileName);
  };

  // Extract unique ID from filename
  const extractUniqueID = (fileName) => {
    // Get the base filename without path
    const baseFileName = fileName.split(/[/\\]/).pop();
    
    // Remove file extension
    const fileNameWithoutExt = baseFileName.replace(/\.[^/.]+$/, '');
    
    const parts = fileNameWithoutExt.split('_');
    return parts.length === 2 ? parts[0] : null;
  };

  const generateHash = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileContent = reader.result;
        const wordArray = CryptoJS.lib.WordArray.create(fileContent);
        const fileHash = CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Base64);
        resolve(fileHash);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const fetchAssociatedDocuments = async (uniqueID) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/documents/${uniqueID}`);


      console.log(response.data);


      return response.data || [];
    } catch (error) {
      console.error("Error fetching associated documents:", error);
      return [];
    }
  };

  const verifyFileHash = async (file, associatedDocuments) => {
    const fileHash = await generateHash(file);
    
    // Verify against associated documents
    const matchedDocument = associatedDocuments.find(
      docInfo => docInfo.documentHash === fileHash
    );
    
    return { 
      isValid: !!matchedDocument, 
      matchedDocument,
      fileHash
    };
  };

  const verifyFile = async (file, fileName) => {
    // Validate filename format first
    if (!validateFileName(fileName)) {
      throw new Error('Invalid filename format');
    }

    // Extract unique ID
    const uniqueID = extractUniqueID(fileName);
    if (!uniqueID) {
      throw new Error('Could not extract unique ID');
    }

    try {
      // Fetch associated documents by unique ID
      const associatedDocuments = await fetchAssociatedDocuments(uniqueID);

      // Verify file hash against associated documents
      const hashVerification = await verifyFileHash(file, associatedDocuments);

      if (!hashVerification.isValid) {
        return {
          fileName,
          uniqueID,
          isValid: false,
          message: "No matching hash found in associated documents",
          associatedDocuments: associatedDocuments.map(doc => ({
            uniqueID: doc.uniqueID,
            certificateType: doc.certificateType,
            ipfsLink: doc.ipfsLink
          })),
          timestamp: new Date().toLocaleString()
        };
      }

      // If hash is valid, return detailed information
      const matchedDoc = hashVerification.matchedDocument;
      return {
        fileName,
        uniqueID: matchedDoc.uniqueID,
        isValid: true,
        message: "Document verified successfully",
        documentDetails: {
          _id: matchedDoc._id,
          certificateType: matchedDoc.certificateType,
          ipfsLink: matchedDoc.ipfsLink,
          timestamp: matchedDoc.timestamp
        },
        fileHash: hashVerification.fileHash,
        associatedDocuments: associatedDocuments.map(doc => ({
          uniqueID: doc.uniqueID,
          certificateType: doc.certificateType,
          ipfsLink: doc.ipfsLink
        })),
        verificationTimestamp: new Date().toLocaleString()
      };
    } catch (error) {
      return {
        fileName,
        uniqueID,
        isValid: false,
        message: error.response?.data?.message || "Error verifying document",
        associatedDocuments: [],
        timestamp: new Date().toLocaleString()
      };
    }
  };

  const handleVerify = async () => {
    if (!document) {
      toast.error("Please select a document to verify");
      return;
    }

    setIsVerifying(true);
    setProgress(0);

    try {
      const result = await verifyFile(document, document.name);

      if (result.isValid) {
        setVerifiedDocuments(prev => [result, ...prev]);
        toast.success(`Verified: ${result.fileName}`);
      } else {
        setFailedDocuments(prev => [result, ...prev]);
        toast.error(`Invalid: ${result.fileName}`);
      }
    } catch (error) {
      const errorMessage = error.message || "Verification failed";
      toast.error(errorMessage);
      setFailedDocuments(prev => [{
        fileName: document.name,
        isValid: false,
        message: errorMessage,
        timestamp: new Date().toLocaleString()
      }, ...prev]);
    } finally {
      setIsVerifying(false);
      setDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setDocument(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    
    if (activeTab === 'zip' && !droppedFile.name.endsWith('.zip')) {
      toast.error('Please drop a ZIP file');
      return;
    }
    
    setDocument(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleZipVerify = async () => {
    if (!document || !document.name.endsWith('.zip')) {
      toast.error("Please select a ZIP file");
      return;
    }

    setIsVerifying(true);
    setProgress(0);
    const newVerifiedDocs = [];
    const newFailedDocs = [];

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(document);
      const fileEntries = Object.entries(contents.files)
        .filter(([path, file]) => !file.dir);
      const totalFiles = fileEntries.length;
      let processedFiles = 0;

      for (const [fileName, file] of fileEntries) {
        try {
          const fileContent = await file.async('blob');
          const fileHash = await generateHash(fileContent);
          
          try {
            const result = await verifyFile(fileContent, fileName, fileHash);

            if (result.isValid) {
              newVerifiedDocs.push(result);
              toast.success(`Verified: ${result.fileName}`);
            } else {
              newFailedDocs.push(result);
              toast.error(`Invalid: ${result.fileName}`);
            }
          } catch (error) {
            const errorResult = {
              fileName,
              isValid: false,
              message: error.message || "Verification failed",
              timestamp: new Date().toLocaleString()
            };
            newFailedDocs.push(errorResult);
            toast.error(`Failed: ${fileName}`);
          }

          processedFiles++;
          setProgress(Math.round((processedFiles / totalFiles) * 100));
        } catch (error) {
          console.error(`Error processing file ${fileName}:`, error);
          const errorResult = {
            fileName,
            isValid: false,
            message: "Error processing file",
            timestamp: new Date().toLocaleString()
          };
          newFailedDocs.push(errorResult);
          toast.error(`Failed: ${fileName}`);
        }
      }

      setVerifiedDocuments(prev => [...newVerifiedDocs, ...prev]);
      setFailedDocuments(prev => [...newFailedDocs, ...prev]);
    } catch (error) {
      toast.error("ZIP verification failed");
    } finally {
      setIsVerifying(false);
      setDocument(null);
      setProgress(0);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="container mx-auto my-14 px-4 py-8 max-w-4xl bg-gradient-to-br from-blue-50 via-white to-pink-100 min-h-screen ">
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
          <FileCheck className="mr-2 w-8 h-8 text-blue-600" />
          Document Verification Dashboard
        </h2>
        
        <div className="mb-4 flex space-x-4 justify-center">
          <button
            className={`py-2 px-4 rounded-lg ${
              activeTab === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'
            }`}
            onClick={() => setActiveTab('individual')}
          >
            <FileCheck className="mr-2 inline-block h-4 w-4" /> 
            Individual Document
          </button>
          <button
            className={`py-2 px-4 rounded-lg ${
              activeTab === 'zip' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'
            }`}
            onClick={() => setActiveTab('zip')}
          >
            <FileArchive className="mr-2 inline-block h-4 w-4" /> 
            ZIP Folder
          </button>
        </div>

        <div 
          className="mx-auto w-90 h-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={activeTab === 'zip' ? '.zip' : '*'}
            className="hidden"
          />
          {document ? (
            <div className="text-center">
              <FileCheck className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2 text-sm font-medium truncate max-w-[200px]">
                {document.name}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <DownloadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {activeTab === 'zip' 
                  ? 'Drag and drop ZIP file or click to select' 
                  : 'Drag and drop file or click to select'
                }
              </p>
            </div>
          )}
        </div>

        {document && (
          <div className="mt-4 text-center">
            <button 
              onClick={activeTab === 'individual' ? handleVerify : handleZipVerify}
              disabled={isVerifying}
              className="mx-auto py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="mr-2 inline-block h-4 w-4" /> 
              {isVerifying 
                ? 'Verifying...' 
                : (activeTab === 'zip' ? 'Verify ZIP Folder' : 'Verify Document')
              }
            </button>
            {isVerifying && (
              <div className="w-64 mx-auto mt-2 bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-600 h-2 rounded"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-8">
          {/* Verified Documents List */}
          <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <FileCheck className="mr-2 h-5 w-5 text-green-500" /> 
              Verified Documents
            </h3>
            {verifiedDocuments.length > 0 && (
              <button 
                onClick={() => setVerifiedDocuments([])}
                className="text-sm text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {verifiedDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center">No verified documents</p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {verifiedDocuments.map((doc, index) => (
                <li 
                  key={index} 
                  className="p-2 bg-green-50 rounded"
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <span className="text-xs text-green-600">Verified</span>
                  </div>
                  <p className="text-xs text-gray-500">Unique ID: {doc.uniqueID}</p>
                  <p className="text-xs text-gray-500">Certificate Type: {doc.documentDetails?.certificateType}</p>
                  <p className="text-xs text-gray-500">Verification Time: {doc.verificationTimestamp}</p>
                  {doc.documentDetails?.ipfsLink && (
                    <div className="mt-2">
                      <a 
                        href={doc.documentDetails.ipfsLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View on IPFS
                      </a>
                    </div>
                  )}
                  {doc.associatedDocuments && doc.associatedDocuments.length > 0 && (
                    <div className="mt-2 border-t pt-2">
                      <p className="text-xs font-semibold">Associated Documents:</p>
                      <ul className="text-xs text-gray-600 list-disc pl-4">
                        {doc.associatedDocuments.map((assocDoc, idx) => (
                          <li key={idx}>
                            {assocDoc.uniqueID} - {assocDoc.certificateType}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

          {/* Failed Documents List */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileX className="mr-2 h-5 w-5 text-red-500" /> 
                Failed Documents
              </h3>
              {failedDocuments.length > 0 && (
                <button 
                  onClick={() => setFailedDocuments([])}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {failedDocuments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No failed documents</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {failedDocuments.map((doc, index) => (
                  <li 
                    key={index} 
                    className="p-2 bg-red-50 rounded"
                  >
                    <p className="text-sm font-medium truncate">{doc.fileName}</p>
                    <p className="text-xs text-gray-500">{doc.message}</p>
                    <p className="text-xs text-gray-500">{doc.timestamp}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyDash;