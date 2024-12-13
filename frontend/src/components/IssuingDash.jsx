import React, { useState, useRef } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import CryptoJS from 'crypto-js';
import { 
  FileCheck, 
  FileArchive, 
  Upload, 
  DownloadCloud 
} from 'lucide-react';
import toast from 'react-hot-toast';

const UploadDash = () => {
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [successfulDocuments, setSuccessfulDocuments] = useState([]);
  const [failedDocuments, setFailedDocuments] = useState([]);
  const fileInputRef = useRef(null);

  const validateFileName = (fileName) => {
    // Get the base filename without path
    const baseFileName = fileName.split(/[/\\]/).pop();
    
    // Regex to check if filename matches the format: UniqueID_CertificateType
    const fileNameRegex = /^[A-Z]{2}\d{4}_[A-Za-z\s-]+\.[a-zA-Z0-9]+$/;
    return fileNameRegex.test(baseFileName);
  };

  const extractFileDetails = (fileName) => {
    // Get the base filename without path
    const baseFileName = fileName.split(/[/\\]/).pop();
    
    // Remove file extension
    const fileNameWithoutExt = baseFileName.replace(/\.[^/.]+$/, '');
    
    const parts = fileNameWithoutExt.split('_');
    if (parts.length !== 2) return null;

    const [uniqueID, certificateType] = parts;
    return {
      uniqueID,
      certificateType
    };
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

  const uploadFile = async (file, fileName, fileHash) => {
    // Validate filename format
    if (!validateFileName(fileName)) {
      throw new Error('Invalid filename format');
    }

    // Extract details from filename
    const fileDetails = extractFileDetails(fileName);
    
    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentHash", fileHash);
    formData.append("uniqueID", fileDetails.uniqueID);
    formData.append("certificateType", fileDetails.certificateType);

    try {
      const response = await axios.post(
        "https://sih-project-xtmx.onrender.com/api/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        fileName,
        fileHash,
        isSuccessful: true,
        message: response.data.message,
        timestamp: new Date().toLocaleString()
      };
    } catch (error) {
      return {
        fileName,
        fileHash,
        isSuccessful: false,
        message: error.response?.data?.message || "Error uploading document",
        timestamp: new Date().toLocaleString()
      };
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

  const handleIndividualUpload = async () => {
    if (!document) {
      toast.error("Please select a document to upload");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const fileHash = await generateHash(document);
      const result = await uploadFile(document, document.name, fileHash);

      if (result.isSuccessful) {
        setSuccessfulDocuments(prev => [result, ...prev]);
        toast.success(`Uploaded: ${result.fileName}`);
      } else {
        setFailedDocuments(prev => [result, ...prev]);
        toast.error(`Failed: ${result.fileName}`);
      }
    } catch (error) {
      const errorMessage = error.message || "Upload failed";
      toast.error(errorMessage);
      setFailedDocuments(prev => [{
        fileName: document.name,
        isSuccessful: false,
        message: errorMessage,
        timestamp: new Date().toLocaleString()
      }, ...prev]);
    } finally {
      setIsUploading(false);
      setDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleZipUpload = async () => {
    if (!document || !document.name.endsWith('.zip')) {
      toast.error("Please select a ZIP file");
      return;
    }

    setIsUploading(true);
    setProgress(0);
    const newSuccessfulDocs = [];
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
            const result = await uploadFile(fileContent, fileName, fileHash);

            if (result.isSuccessful) {
              newSuccessfulDocs.push(result);
              toast.success(`Uploaded: ${result.fileName}`);
            } else {
              newFailedDocs.push(result);
              toast.error(`Failed: ${result.fileName}`);
            }
          } catch (error) {
            const errorResult = {
              fileName,
              fileHash,
              isSuccessful: false,
              message: error.message || "Upload failed",
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
            isSuccessful: false,
            message: "Error processing file",
            timestamp: new Date().toLocaleString()
          };
          newFailedDocs.push(errorResult);
          toast.error(`Failed: ${fileName}`);
        }
      }

      setSuccessfulDocuments(prev => [...newSuccessfulDocs, ...prev]);
      setFailedDocuments(prev => [...newFailedDocs, ...prev]);
    } catch (error) {
      toast.error("ZIP upload failed");
    } finally {
      setIsUploading(false);
      setDocument(null);
      setProgress(0);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  return (
    <div className="container mx-auto my-14 px-4 py-8 max-w-4xl bg-gradient-to-br from-blue-50 via-white to-pink-100 min-h-screen">
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
          <Upload className="mr-2 w-8 h-8 text-blue-600" />
          Document Issuer Dashboard
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
          className="mx-auto w-48 h-48 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
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
              onClick={activeTab === 'individual' ? handleIndividualUpload : handleZipUpload}
              disabled={isUploading}
              className="mx-auto py-2 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="mr-2 inline-block h-4 w-4" /> 
              {isUploading 
                ? 'Uploading...' 
                : (activeTab === 'zip' ? 'Upload ZIP Folder' : 'Upload Document')
              }
            </button>
            {isUploading && (
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
          {/* Successful Documents List */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-green-500" /> 
                Successful Uploads
              </h3>
              {successfulDocuments.length > 0 && (
                <button 
                  onClick={() => setSuccessfulDocuments([])}
                  className="text-sm text-red-500 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {successfulDocuments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">No successful uploads</p>
            ) : (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {successfulDocuments.map((doc, index) => (
                  <li 
                    key={index} 
                    className="flex justify-between items-center p-2 bg-green-50 rounded"
                  >
                    <div className="flex-1 truncate mr-2">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Failed Documents List */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-red-500" /> 
                Failed Uploads
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
              <p className="text-sm text-gray-500 text-center">No failed uploads</p>
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

export default UploadDash;
