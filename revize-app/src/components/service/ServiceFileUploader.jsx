import React, { useState } from 'react';
import { uploadServiceFile } from '../../services/serviceFileService';

/**
 * Komponenta pro nahrávání obrázků k servisním výjezdům
 */
const ServiceFileUploader = ({ serviceId, onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handler pro výběr souboru
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kontrola, zda jde o obrázek
    if (!file.type.startsWith('image/')) {
      setError('Lze nahrávat pouze obrázky (JPG, PNG, GIF, WebP).');
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Vytvoření náhledu obrázku
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handler pro změnu popisu
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handler pro nahrání souboru
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vyberte soubor k nahrání.');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const result = await uploadServiceFile(serviceId, selectedFile, description);
      
      // Reset formuláře
      setSelectedFile(null);
      setDescription('');
      setPreview(null);
      
      // Callback s informací o úspěšném nahrání
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      console.error('Chyba při nahrávání souboru:', error);
      setError('Nepodařilo se nahrát soubor. ' + (error.message || ''));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-medium mb-3">Nahrát obrázek</h3>
      
      <div className="space-y-4">
        {/* Výběr souboru */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vyberte obrázek
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Podporované formáty: JPG, PNG, GIF, WebP. Max. velikost: 10 MB.
          </p>
        </div>

        {/* Náhled vybraného obrázku */}
        {preview && (
          <div className="mt-2">
            <p className="text-sm font-medium text-gray-700 mb-1">Náhled:</p>
            <img 
              src={preview} 
              alt="Náhled" 
              className="max-h-40 max-w-full rounded border border-gray-300" 
            />
          </div>
        )}

        {/* Popis obrázku */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Popis obrázku (volitelné)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows="2"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="Zadejte popis obrázku..."
            disabled={uploading}
          />
        </div>
        
        {/* Chybová hláška */}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {/* Tlačítko pro nahrání */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Nahrávání...' : 'Nahrát obrázek'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceFileUploader;