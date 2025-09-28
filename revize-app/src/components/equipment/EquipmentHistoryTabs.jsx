import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRevisionsByEquipmentId, getRevisionPdf } from '../../services/revisionService';
import { getInspectionsByEquipmentId } from '../../services/inspectionService';
import { getServiceVisitsByEquipmentId } from '../../services/serviceService';

const EquipmentHistoryTabs = ({ equipmentId }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('revisions');
  const [revisions, setRevisions] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [serviceVisits, setServiceVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEquipmentHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Načítáme data podle aktivního tabu
        if (activeTab === 'revisions') {
          const data = await getRevisionsByEquipmentId(equipmentId);
          setRevisions(data);
        } else if (activeTab === 'inspections') {
          const data = await getInspectionsByEquipmentId(equipmentId);
          setInspections(data);
        } else if (activeTab === 'service') {
          const data = await getServiceVisitsByEquipmentId(equipmentId);
          setServiceVisits(data);
        }
      } catch (err) {
        console.error(`Chyba při načítání dat pro zařízení ${equipmentId}:`, err);
        setError(`Nepodařilo se načíst data: ${err.message || 'Neznámá chyba'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipmentHistory();
  }, [equipmentId, activeTab]);

  // Formát data do českého formátu
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  // Funkce pro přesměrování do sekce revizí s předvyplněným zařízením
  const handleCreateRevision = () => {
    navigate('/revisions', { state: { createNew: true, equipmentId } });
  };

  // Funkce pro zobrazení detailu revize
  const handleViewRevision = (revisionId) => {
    navigate('/revisions', { state: { viewId: revisionId } });
  };

  // Funkce pro stažení PDF revize
  const handleDownloadPdf = async (id) => {
    try {
      const response = await getRevisionPdf(id);
      
      // Zkontrolovat, zda jsme dostali blob
      if (!(response instanceof Blob)) {
        throw new Error('Neplatná odpověď ze serveru');
      }
      
      // Vytvoření URL objektu z blob dat
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/pdf' })
      );
      
      // Vytvoření odkazu pro stažení
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revize-${id}.pdf`);
      
      // Aktivace stahování
      document.body.appendChild(link);
      link.click();
      
      // Čištění
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error(`Error downloading PDF for revision ${id}:`, err);
      setError('Nastala chyba při stahování PDF. ' + (err.message || ''));
    }
  };

  // Renderování seznamu revizí
  const renderRevisions = () => {
    if (revisions.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          <p>Žádné revize nebyly nalezeny</p>
          <button 
            onClick={handleCreateRevision}
            className="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            + Vytvořit revizi
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Číslo revize</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technik</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vyhodnocení</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Příští revize</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {revisions.map(revision => (
              <tr key={revision.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {revision.revision_number || `RE${revision.id}`}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(revision.revision_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {revision.technician_name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    revision.evaluation?.includes('vyhovuje') 
                      ? 'bg-green-100 text-green-800' 
                      : revision.evaluation?.includes('výhrad') 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {revision.evaluation?.includes('vyhovuje') 
                      ? 'Vyhovuje' 
                      : revision.evaluation?.includes('výhrad') 
                        ? 'Vyhovuje s výhradami'
                        : 'Nevyhovuje'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(revision.next_revision_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewRevision(revision.id)} 
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Detail
                  </button>
                  <button 
                    onClick={() => handleDownloadPdf(revision.id)} 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Funkce pro přesměrování do sekce inspekcí s předvyplněným zařízením
  const handleCreateInspection = () => {
    navigate('/inspections', { state: { createNew: true, equipmentId } });
  };

  // Funkce pro zobrazení detailu inspekce
  const handleViewInspection = (inspectionId) => {
    navigate('/inspections', { state: { viewId: inspectionId } });
  };

  // Renderování seznamu inspekcí
  const renderInspections = () => {
    if (inspections.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          <p>Žádné inspekce nebyly nalezeny</p>
          <button 
            onClick={handleCreateInspection} 
            className="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            + Vytvořit inspekci
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspektor</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ inspekce</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Výsledek</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Příští inspekce</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspections.map(inspection => (
              <tr key={inspection.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(inspection.inspection_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {inspection.inspector_name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {inspection.inspection_type || "Standardní"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    inspection.result === 'pass' || inspection.result?.toLowerCase().includes('vyhovuje')
                      ? 'bg-green-100 text-green-800' 
                      : inspection.result === 'warning' || inspection.result?.toLowerCase().includes('výhrad')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {inspection.result === 'pass' || inspection.result?.toLowerCase().includes('vyhovuje')
                      ? 'Vyhovuje' 
                      : inspection.result === 'warning' || inspection.result?.toLowerCase().includes('výhrad')
                        ? 'Vyhovuje s výhradami'
                        : 'Nevyhovuje'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(inspection.next_inspection_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewInspection(inspection.id)} 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Funkce pro přesměrování do sekce servisních výjezdů s předvyplněným zařízením
  const handleCreateServiceVisit = () => {
    navigate('/services', { state: { createNew: true, equipmentId } });
  };

  // Funkce pro zobrazení detailu servisního výjezdu
  const handleViewServiceVisit = (serviceId) => {
    navigate('/services', { state: { viewId: serviceId } });
  };

  // Renderování seznamu servisních výjezdů
  const renderServiceVisits = () => {
    if (serviceVisits.length === 0) {
      return (
        <div className="py-4 text-center text-gray-500">
          <p>Žádné servisní výjezdy nebyly nalezeny</p>
          <button 
            onClick={handleCreateServiceVisit} 
            className="mt-2 inline-block text-blue-600 hover:text-blue-800"
          >
            + Vytvořit servisní výjezd
          </button>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Technik</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Typ servisu</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popis</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stav</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Akce</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {serviceVisits.map(service => (
              <tr key={service.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(service.visit_date)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {service.technician_name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {service.service_type || "Standardní"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">
                  {service.description || "-"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    service.status?.toLowerCase().includes('dokon') || service.status === 'completed'
                      ? 'bg-green-100 text-green-800' 
                      : service.status?.toLowerCase().includes('prob') || service.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : service.status?.toLowerCase().includes('naplá') || service.status === 'planned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {service.status?.toLowerCase().includes('dokon') || service.status === 'completed'
                      ? 'Dokončeno' 
                      : service.status?.toLowerCase().includes('prob') || service.status === 'in-progress'
                        ? 'Probíhá'
                        : service.status?.toLowerCase().includes('naplá') || service.status === 'planned'
                          ? 'Naplánováno'
                          : service.status || 'Neuvedeno'}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleViewServiceVisit(service.id)} 
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="mt-6 bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('revisions')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'revisions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Revize
          </button>
          <button
            onClick={() => setActiveTab('inspections')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'inspections'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Inspekce
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'service'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Servisní záznamy
          </button>
        </nav>
      </div>
      <div className="p-4">
        {/* Zobrazení chyby */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Zobrazení načítání */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'revisions' && renderRevisions()}
            {activeTab === 'inspections' && renderInspections()}
            {activeTab === 'service' && renderServiceVisits()}
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentHistoryTabs;