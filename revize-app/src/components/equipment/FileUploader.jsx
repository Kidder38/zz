import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { uploadEquipmentFile } from '../../services/equipmentFileService';
import { FaUpload, FaTimes, FaSpinner } from 'react-icons/fa';

const FileUploader = ({ equipmentId, fileType, onFileUploaded, label }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const fileTypeLabels = {
    photo: 'fotografii',
    datasheet: 'datový list',
    manual: 'manuál'
  };
  
  const fileTypeLabel = fileTypeLabels[fileType] || 'soubor';

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleUpload = async () => {
    if (!file) {
      setError(`Prosím, vyberte ${fileTypeLabel} k nahrání`);
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const fileData = {
        file,
        fileType,
        description
      };

      const uploadedFile = await uploadEquipmentFile(equipmentId, fileData);
      
      setFile(null);
      setDescription('');
      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError(`Chyba při nahrávání souboru: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className="border rounded-md p-4 mb-4">
      <h3 className="font-semibold mb-2">{label || `Nahrát ${fileTypeLabel}`}</h3>
      
      <div className="mb-3">
        <input
          type="file"
          id={`file-${fileType}`}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <label
          htmlFor={`file-${fileType}`}
          className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-4 rounded-md inline-flex items-center"
        >
          <FaUpload className="mr-2" />
          <span>Vybrat soubor</span>
        </label>

        {file && (
          <div className="mt-2 bg-gray-50 p-2 rounded-md flex justify-between items-center">
            <span className="text-sm truncate max-w-xs">{file.name}</span>
            <button
              type="button"
              onClick={clearFile}
              className="text-red-500 hover:text-red-700"
              disabled={isUploading}
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {file && (
        <div className="mb-3">
          <label htmlFor={`description-${fileType}`} className="block text-sm font-medium text-gray-700 mb-1">
            Popis (volitelný)
          </label>
          <input
            type="text"
            id={`description-${fileType}`}
            value={description}
            onChange={handleDescriptionChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Zadejte popis souboru"
            disabled={isUploading}
          />
        </div>
      )}

      {error && <div className="text-red-500 text-sm mb-3">{error}</div>}

      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-4 py-2 inline-flex items-center"
        >
          {isUploading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Nahrávání...
            </>
          ) : (
            <>Nahrát</>
          )}
        </button>
      )}
    </div>
  );
};

FileUploader.propTypes = {
  equipmentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  fileType: PropTypes.oneOf(['photo', 'datasheet', 'manual']).isRequired,
  onFileUploaded: PropTypes.func,
  label: PropTypes.string
};

export default FileUploader;