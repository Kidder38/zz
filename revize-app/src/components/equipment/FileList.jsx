import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getEquipmentFilesByType, deleteEquipmentFile, getFileDownloadUrl } from '../../services/equipmentFileService';
import { FaDownload, FaTrash, FaSpinner, FaImage, FaFile, FaFileAlt } from 'react-icons/fa';
import { formatDate } from '../../utils/dateUtils';

const FileList = ({ equipmentId, fileType, refresh, onDeleteFile }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState({});

  const fileTypeLabels = {
    photo: 'Fotografie',
    datasheet: 'Datové listy',
    manual: 'Manuály'
  };
  
  const fileTypeLabel = fileTypeLabels[fileType] || 'Soubory';
  
  const fileTypeIcons = {
    photo: <FaImage className="text-blue-500" />,
    datasheet: <FaFileAlt className="text-green-500" />,
    manual: <FaFile className="text-amber-500" />
  };
  
  const fileIcon = fileTypeIcons[fileType] || <FaFile className="text-gray-500" />;

  useEffect(() => {
    if (equipmentId) {
      fetchFiles();
    } else {
      setFiles([]);
      setLoading(false);
    }
  }, [equipmentId, fileType, refresh]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEquipmentFilesByType(equipmentId, fileType);
      setFiles(data);
    } catch (error) {
      console.error(`Error fetching ${fileType} files:`, error);
      setError(`Nelze načíst soubory: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Opravdu chcete smazat tento soubor?')) {
      try {
        setDeleteInProgress({ ...deleteInProgress, [fileId]: true });
        await deleteEquipmentFile(fileId);
        
        // Update the local state
        setFiles(files.filter(file => file.id !== fileId));
        
        if (onDeleteFile) {
          onDeleteFile(fileId);
        }
      } catch (error) {
        console.error('Error deleting file:', error);
        alert(`Chyba při mazání souboru: ${error.message}`);
      } finally {
        setDeleteInProgress({ ...deleteInProgress, [fileId]: false });
      }
    }
  };

  // For photos, render image previews
  const renderPhotoPreview = (file) => {
    const downloadUrl = getFileDownloadUrl(file.id);
    
    return (
      <div className="relative group">
        <div className="aspect-square overflow-hidden bg-gray-100 rounded-md flex items-center justify-center">
          <img 
            src={downloadUrl} 
            alt={file.description || file.file_name} 
            className="object-cover w-full h-full"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150?text=Náhled+nedostupný";
              e.target.onerror = null;
            }}
          />
        </div>
        <div className="mt-1 text-xs truncate">{file.description || file.file_name}</div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex space-x-2">
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              <FaDownload />
            </a>
            <button
              onClick={() => handleDelete(file.id)}
              disabled={deleteInProgress[file.id]}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
            >
              {deleteInProgress[file.id] ? <FaSpinner className="animate-spin" /> : <FaTrash />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // For other file types, render as a list
  const renderFileItem = (file) => {
    const downloadUrl = getFileDownloadUrl(file.id);
    
    return (
      <div className="border rounded-md p-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-3">
            {fileIcon}
          </div>
          <div>
            <div className="font-medium text-sm">{file.file_name}</div>
            {file.description && <div className="text-xs text-gray-600">{file.description}</div>}
            <div className="text-xs text-gray-500">
              Nahráno: {formatDate(file.created_at)}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <FaDownload />
          </a>
          <button
            onClick={() => handleDelete(file.id)}
            disabled={deleteInProgress[file.id]}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            {deleteInProgress[file.id] ? <FaSpinner className="animate-spin" /> : <FaTrash />}
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-4 text-center">
        <FaSpinner className="animate-spin mx-auto text-blue-500 text-xl" />
        <p className="mt-2 text-gray-600">Načítání souborů...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        Žádné {fileTypeLabel.toLowerCase()} nebyly nalezeny.
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-3">{fileTypeLabel}</h3>
      
      {fileType === 'photo' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <div key={file.id}>
              {renderPhotoPreview(file)}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map(file => (
            <div key={file.id}>
              {renderFileItem(file)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

FileList.propTypes = {
  equipmentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  fileType: PropTypes.oneOf(['photo', 'datasheet', 'manual']).isRequired,
  refresh: PropTypes.number,
  onDeleteFile: PropTypes.func
};

export default FileList;