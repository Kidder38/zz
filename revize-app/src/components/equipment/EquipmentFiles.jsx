import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import FileUploader from './FileUploader';
import FileList from './FileList';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const EquipmentFiles = ({ equipmentId }) => {
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [activeSection, setActiveSection] = useState('photos'); // 'photos', 'datasheets', 'manuals'
  
  // Reset active section when equipment changes
  useEffect(() => {
    setActiveSection('photos');
    setRefreshCounter(prev => prev + 1);
  }, [equipmentId]);
  
  const handleFileUploaded = () => {
    // Refresh the file list when a new file is uploaded
    setRefreshCounter(prev => prev + 1);
  };
  
  const handleDeleteFile = () => {
    // Refresh the file list when a file is deleted
    setRefreshCounter(prev => prev + 1);
  };
  
  const renderSection = (sectionName, title, fileType) => {
    const isActive = activeSection === sectionName;
    
    return (
      <div className="border rounded-md mb-4">
        <button
          type="button"
          className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100"
          onClick={() => setActiveSection(isActive ? null : sectionName)}
        >
          <h2 className="font-semibold text-lg">{title}</h2>
          {isActive ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        
        {isActive && (
          <div className="p-4">
            <FileUploader 
              equipmentId={equipmentId} 
              fileType={fileType}
              onFileUploaded={handleFileUploaded}
            />
            
            <FileList 
              equipmentId={equipmentId} 
              fileType={fileType}
              refresh={refreshCounter}
              onDeleteFile={handleDeleteFile}
            />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Soubory a dokumentace</h2>
      
      {renderSection('photos', 'Fotografie', 'photo')}
      {renderSection('datasheets', 'Datové listy', 'datasheet')}
      {renderSection('manuals', 'Manuály', 'manual')}
    </div>
  );
};

EquipmentFiles.propTypes = {
  equipmentId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
};

export default EquipmentFiles;