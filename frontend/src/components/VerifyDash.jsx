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
  DownloadCloud,
  Clock 
} from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyDash = () => {
  const [document, setDocument] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verifiedDocuments, setVerifiedDocuments] = useState([]);
  const [failedDocuments, setFailedDocuments] = useState([]);
  const [expirationAnalysis, setExpirationAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Expiration Detection Configuration
  const GROQ_API_KEY = "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";
  const EXPIRATION_KEYWORDS = [
    'expiration', 'expires', 'valid until', 'valid through', 
    'expire date', 'validity', 'termination', 'end date'
  ];

  const extractTextFromFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const analyzeDocumentExpiration = async (fileContent) => {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: `You are an expert document analyzer. 
              Detect potential expiration dates in the document. 
              Look for keywords related to expiration, validity periods, 
              and termination dates. Provide a detailed analysis.`
            },
            {
              role: "user",
              content: `Analyze this document for potential expiration information:
              
              ${fileContent.substring(0, 5000)}  // Limit initial text to prevent overwhelming the API
              
              Identify:
              - Any explicit expiration dates
              - Potential validity periods
              - Confidence in expiration detection
              - Risk assessment for document validity`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Expiration analysis error:', error);
      return "Unable to perform advanced expiration analysis.";
    }
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

  const detectSimpleExpiration = (fileContent) => {
    const content = fileContent.toLowerCase();
    const expirationDetected = EXPIRATION_KEYWORDS.some(keyword => 
      content.includes(keyword)
    );

    // Basic date format detection
    const dateFormats = [
  // 1. DD-MM-YYYY or MM-DD-YYYY or YYYY-MM-DD
  /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/, 

  // 2. Month DD, YYYY (e.g., January 1, 2023)
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i, 

  // 3. DD Month YYYY (e.g., 1 January 2023)
  /\b\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i, 

  // 4. YYYY/MM/DD or YYYY.MM.DD
  /\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b/, 

  // 5. MM/DD/YYYY or DD/MM/YYYY with optional leading zeros
  /\b(?:0?[1-9]|1[0-2])[-/](?:0?[1-9]|[12][0-9]|3[01])[-/]\d{4}\b/, 

  // 6. Month YYYY (e.g., January 2023)
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i, 

  // 7. DD.MM.YYYY (European format with dots)
  /\b\d{1,2}\.\d{1,2}\.\d{4}\b/, 

  // 8. MM-YYYY or YYYY-MM (Year and Month only)
  /\b(?:0?[1-9]|1[0-2])[-/]\d{4}\b|\b\d{4}[-/](?:0?[1-9]|1[0-2])\b/, 

  // 9. Month DDth, YYYY (e.g., January 1st, 2023)
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b/i, 

  // 10. Epoch timestamps (digits only)
  /\b\d{10}\b/, 

  // 11. Day-of-Week, Month DD, YYYY (e.g., Monday, January 1, 2023)
  /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i, 

  // 12. ISO 8601 format (e.g., 2023-01-01T12:00:00Z)
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z\b/, 

  // 13. Abbreviated month names (e.g., Jan 1, 2023)
  /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4}\b/i, 

  // 14. YYYY (Year only)
  /\b\d{4}\b/ 
];


    const potentialDates = dateFormats.flatMap(regex => 
      (fileContent.match(regex) || [])
    );

    return {
      detected: expirationDetected,
      keywords: EXPIRATION_KEYWORDS.filter(keyword => 
        content.includes(keyword)
      ),
      potentialDates
    };
  };

  const verifyFile = async (file, fileName, fileHash) => {
    try {
      // Simple text extraction for initial screening
      const fileContent = await extractTextFromFile(file);
      
      // Perform simple expiration detection
      const simpleExpirationCheck = detectSimpleExpiration(fileContent);
      
      // Advanced ML-based expiration analysis
      const advancedExpirationAnalysis = await analyzeDocumentExpiration(fileContent);

      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentHash", fileHash);

      const response = await axios.post(
        "http://localhost:5000/api/documents/verify",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Combine verification results
      return {
        fileName,
        fileHash,
        isValid: response.data.isValid,
        ipfsLink: response.data.ipfsLink,
        message: response.data.message,
        timestamp: new Date().toLocaleString(),
        expirationAnalysis: {
          simpleDetection: simpleExpirationCheck,
          advancedAnalysis: advancedExpirationAnalysis
        }
      };
    } catch (error) {
      return {
        fileName,
        fileHash,
        isValid: false,
        message: error.response?.data?.message || "Error verifying document",
        timestamp: new Date().toLocaleString(),
        expirationAnalysis: null
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
      alert('Please drop a ZIP file');
      return;
    }
    
    setDocument(droppedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleVerify = async () => {
    if (!document) {
      alert("Please select a document to verify");
      return;
    }

    setIsVerifying(true);
    setProgress(0);
    setExpirationAnalysis(null);

    try {
      const fileHash = await generateHash(document);
      const result = await verifyFile(document, document.name, fileHash);

      // Set expiration analysis for display
      setExpirationAnalysis(result.expirationAnalysis);

      if (result.isValid) {
        setVerifiedDocuments(prev => [result, ...prev]);
        toast.success(`Verified: ${result.fileName}`);
      } else {
        setFailedDocuments(prev => [result, ...prev]);
        alert(`Invalid: ${result.fileName}`);
      }
    } catch (error) {
      alert("Verification failed");
    } finally {
      setIsVerifying(false);
      setDocument(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Render the expiration analysis
  const renderExpirationAnalysis = () => {
    if (!expirationAnalysis) return null;

    return (
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-bold flex items-center mb-2">
          <Clock className="mr-2 text-yellow-600" /> 
          Expiration Analysis
        </h4>
        <div className="space-y-2">
          <p className="text-sm">
            <strong>Expiration Keywords:</strong>{' '}
            {expirationAnalysis.simpleDetection.keywords.length > 0 
              ? expirationAnalysis.simpleDetection.keywords.join(', ') 
              : 'No specific expiration keywords detected'}
          </p>
          {expirationAnalysis.simpleDetection.potentialDates.length > 0 && (
            <p className="text-sm">
              <strong>Potential Dates:</strong>{' '}
              {expirationAnalysis.simpleDetection.potentialDates.join(', ')}
            </p>
          )}
          <details className="text-sm bg-white p-2 rounded">
            <summary>Advanced ML Analysis</summary>
            <pre className="text-xs overflow-x-auto">
              {expirationAnalysis.advancedAnalysis}
            </pre>
          </details>
        </div>
      </div>
    );
  };





  const handleZipVerify = async () => {
    // ... (previous ZIP verification logic remains the same)
    if (!document || !document.name.endsWith('.zip')) {
        alert("Please select a ZIP file");
        return;
      }
  
      setIsVerifying(true);
      setProgress(0);
      const newVerifiedDocs = [];
      const newFailedDocs = [];
  
      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(document);
        const totalFiles = Object.keys(contents.files).filter(f => !contents.files[f].dir).length;
        let processedFiles = 0;
  
        for (const fileName of Object.keys(contents.files)) {
          const file = contents.files[fileName];
          if (!file.dir) {
            const fileContent = await file.async('blob');
            const fileHash = await generateHash(fileContent);
            const result = await verifyFile(fileContent, fileName, fileHash);
  
            if (result.isValid) {
              newVerifiedDocs.push(result);
              toast.success(`Verified: ${result.fileName}`);
            } else {
              newFailedDocs.push(result);
              alert(`Invalid: ${result.fileName}`);
            }
  
            processedFiles++;
            setProgress(Math.round((processedFiles / totalFiles) * 100));
          }
        }
  
        setVerifiedDocuments(prev => [...newVerifiedDocs, ...prev]);
        setFailedDocuments(prev => [...newFailedDocs, ...prev]);
      } catch (error) {
        alert("ZIP verification failed");
      } finally {
        setIsVerifying(false);
        setDocument(null);
        setProgress(0);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }
  };

  // Rest of the component remains the same as previous implementation
  return (
    <div className="container mx-auto my-14 px-4 py-8 max-w-4xl bg-gradient-to-br from-blue-50 via-white to-pink-100 min-h-screen">
      {/* Previous UI implementation */}
      <div className="w-full">
        {/* ... existing code ... */}
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

        {/* Rest of the component (verified and failed documents lists) remains the same as in previous version */}
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
                    className="flex justify-between items-center p-2 bg-green-50 rounded"
                  >
                    <div className="flex-1 truncate mr-2">
                      <p className="text-sm font-medium truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{doc.timestamp}</p>
                    </div>
                    <button 
                      onClick={() => window.open(`https:/${doc.ipfsLink}`, '_blank')}
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </button>
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
        
        {/* Add expiration analysis rendering */}
        {renderExpirationAnalysis()}
      </div>
    </div>
  );
};

export default VerifyDash;