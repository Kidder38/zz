import React, { useState } from 'react';
import ServiceFileUploader from './ServiceFileUploader';
import ServiceFileList from './ServiceFileList';

/**
 * Komponenta pro správu obrázků k servisnímu výjezdu
 */
const ServiceFiles = ({ serviceId, serviceData }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handler pro úspěšné nahrání souboru
  const handleUploadSuccess = () => {
    // Trigger pro překreslení seznamu souborů
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Obrázky servisního výjezdu</h2>
      
      {/* Nahání nových obrázků - dostupné jen pokud máme ID servisního výjezdu */}
      {serviceId && (
        <ServiceFileUploader 
          serviceId={serviceId} 
          onUploadSuccess={handleUploadSuccess} 
        />
      )}
      
      {/* Seznam nahraných obrázků */}
      {serviceId ? (
        <ServiceFileList 
          serviceId={serviceId} 
          refreshTrigger={refreshTrigger} 
        />
      ) : (
        <div className="text-gray-500 py-4">
          Pro správu obrázků nejprve uložte servisní výjezd.
        </div>
      )}
    </div>
  );
};

export default ServiceFiles;