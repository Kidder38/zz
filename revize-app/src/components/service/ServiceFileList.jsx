import React, { useState, useEffect } from 'react';
import { getServiceFiles, deleteServiceFile, getServiceFileDownloadUrl } from '../../services/serviceFileService';

/**
 * Komponenta pro zobrazení seznamu obrázků k servisnímu výjezdu
 */
const ServiceFileList = ({ serviceId, refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Načtení souborů
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const data = await getServiceFiles(serviceId);
        setFiles(data);
        setError(null);
      } catch (error) {
        console.error('Chyba při načítání souborů:', error);
        setError('Nepodařilo se načíst soubory.');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchFiles();
    }
  }, [serviceId, refreshTrigger]);

  // Handler pro smazání souboru
  const handleDelete = async (fileId) => {
    if (!window.confirm('Opravdu chcete smazat tento soubor?')) {
      return;
    }

    try {
      await deleteServiceFile(fileId);
      // Aktualizace seznamu souborů
      setFiles(files.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Chyba při mazání souboru:', error);
      alert('Nepodařilo se smazat soubor.');
    }
  };

  // Handler pro zobrazení obrázku v modálním okně
  const handleImageClick = (file) => {
    setSelectedImage(file);
  };

  // Zavření modálního okna
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Formátování data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Formátování velikosti souboru
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  if (files.length === 0) {
    return <div className="text-gray-500 py-4">Žádné obrázky</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {files.map(file => (
          <div key={file.id} className="bg-white rounded-lg shadow overflow-hidden">
            {/* Náhled obrázku */}
            <div 
              className="h-40 bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={() => handleImageClick(file)}
            >
              <img 
                src={getServiceFileDownloadUrl(file.id)} 
                alt={file.description || file.file_name} 
                className="max-h-40 max-w-full object-contain"
              />
            </div>
            
            {/* Informace o souboru */}
            <div className="p-3">
              <div className="font-medium text-sm truncate" title={file.file_name}>
                {file.file_name}
              </div>
              {file.description && (
                <div className="text-sm text-gray-600 mt-1 truncate" title={file.description}>
                  {file.description}
                </div>
              )}
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{formatFileSize(file.file_size)}</span>
                <span>{formatDate(file.created_at)}</span>
              </div>
              
              {/* Akce */}
              <div className="flex justify-between mt-3">
                <a 
                  href={getServiceFileDownloadUrl(file.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Stáhnout
                </a>
                <button 
                  onClick={() => handleDelete(file.id)} 
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Smazat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modální okno pro zobrazení obrázku */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeModal}>
          <div className="max-w-4xl max-h-screen p-4" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={getServiceFileDownloadUrl(selectedImage.id)} 
                  alt={selectedImage.description || selectedImage.file_name} 
                  className="max-h-[80vh] max-w-full object-contain"
                />
                <button 
                  onClick={closeModal}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium">{selectedImage.file_name}</h3>
                {selectedImage.description && (
                  <p className="text-gray-600 mt-1">{selectedImage.description}</p>
                )}
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                  <span>{formatFileSize(selectedImage.file_size)}</span>
                  <span>{formatDate(selectedImage.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceFileList;