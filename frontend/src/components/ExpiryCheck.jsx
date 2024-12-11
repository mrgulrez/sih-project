import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { extractTextFromFile } from '../utils/extractText';
import toast from 'react-hot-toast';

const ExpiryCheck = ({ file, onCheckComplete }) => {
  const [loading, setLoading] = useState(false);
  const [expiryInfo, setExpiryInfo] = useState(null);

  const checkExpiry = async (text) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_GROQ_API_URL}`,
        {
          prompt: `Extract the expiry date from this document: "${text}". If no expiry date is found, return "No expiry date."`,
          model: 'llama',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const output = response.data.output;
      const expiryDate = output.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;

      return { expiryDate, isExpired };
    } catch (error) {
      console.error('Error checking expiry:', error);
      throw new Error('Failed to check expiry date.');
    }
  };

  const handleExpiryCheck = async () => {
    setLoading(true);
    try {
      const text = await extractTextFromFile(file);
      const result = await checkExpiry(text);
      setExpiryInfo(result);
      onCheckComplete(result);
    } catch (error) {
      toast.error(error.message || 'Failed to check expiry date');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (file) {
      handleExpiryCheck();
    }
  }, [file]);

  return (
    <div>
      {loading ? (
        <p>Checking expiry date...</p>
      ) : expiryInfo ? (
        expiryInfo.isExpired ? (
          <p className="text-red-500">Expired on: {expiryInfo.expiryDate || 'Unknown'}</p>
        ) : (
          <p className="text-green-500">Valid until: {expiryInfo.expiryDate || 'Unknown'}</p>
        )
      ) : (
        <p>No expiry information available</p>
      )}
    </div>
  );
};

export default ExpiryCheck;
