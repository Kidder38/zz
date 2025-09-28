import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import InspectionForm from '../components/forms/InspectionForm';
import { 
  getInspections, 
  getInspectionById, 
  createInspection, 
  updateInspection, 
  deleteInspection
} from '../services/inspectionService';

const Inspections = () => {
  const location = useLocation();
  const [inspections, setInspections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentInspection, setCurrentInspection] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  const [initialEquipmentId, setInitialEquipmentId] = useState(null);

  // Načtení inspekcí
  useEffect(() => {
    fetchInspections();
  }, []);

  // Zpracování navigačního stavu - otevření detailu nebo vytvoření nové inspekce
  useEffect(() => {
    const handleLocationState = async () => {
      // Pokud existuje location.state, zpracujeme ho
      if (location.state) {
        // Pokud přecházíme z detailu zařízení a máme viewId, načteme a zobrazíme inspekci
        if (location.state.viewId) {
          try {
            setIsLoading(true);
            const inspection = await getInspectionById(location.state.viewId);
            setCurrentInspection(inspection);
            setModalMode('view');
            setModalOpen(true);
          } catch (err) {
            console.error('Chyba při načítání inspekce:', err);
            setError('Nepodařilo se načíst detail inspekce.');
          } finally {
            setIsLoading(false);
          }
        }
        // Pokud chceme vytvořit novou inspekci a máme equipmentId
        else if (location.state.createNew && location.state.equipmentId) {
          setInitialEquipmentId(location.state.equipmentId);
          setModalMode('create');
          setModalOpen(true);
        }
        
        // Vyčistíme state, aby se modální okno neotevíralo při každém renderu
        window.history.replaceState({}, document.title);
      }
    };
    
    handleLocationState();
  }, [location]);

  const fetchInspections = async () => {
    try {
      setIsLoading(true);
      const data = await getInspections();
      setInspections(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání inspekcí.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Otevření modálního okna pro vytvoření inspekce
  const handleAddClick = () => {
    setCurrentInspection(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Otevření modálního okna pro úpravu inspekce
  const handleEditClick = (inspection) => {
    setCurrentInspection(inspection);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Otevření modálního okna pro detail inspekce
  const handleDetailClick = (inspection) => {
    setCurrentInspection(inspection);
    setModalMode('view');
    setModalOpen(true);
  };

  // Otevření modálního okna pro smazání inspekce
  const handleDeleteClick = (inspection) => {
    setCurrentInspection(inspection);
    setModalMode('delete');
    setModalOpen(true);
  };

  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Vytvoření nebo úprava inspekce
  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'create') {
        await createInspection(values);
      } else if (modalMode === 'edit') {
        await updateInspection(currentInspection.id, values);
      }
      
      // Aktualizace seznamu inspekcí
      fetchInspections();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při ukládání inspekce.');
      console.error(err);
    }
  };

  // Smazání inspekce
  const handleDelete = async () => {
    try {
      await deleteInspection(currentInspection.id);
      
      // Aktualizace seznamu inspekcí
      fetchInspections();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání inspekce.');
      console.error(err);
    }
  };

  // Získání barvy pro typ inspekce
  const getInspectionTypeColor = (type) => {
    switch(type) {
      case 'Pravidelná':
        return 'bg-blue-100 text-blue-800';
      case 'Mimořádná':
        return 'bg-purple-100 text-purple-800';
      case 'Kontrolní':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
      case 'edit':
        // Při vytváření nové inspekce můžeme mít předvyplněné ID zařízení, pokud přicházíme ze stránky zařízení
        const formInitialValues = modalMode === 'edit' 
          ? currentInspection 
          : initialEquipmentId 
            ? { equipment_id: initialEquipmentId } 
            : null;
            
        return (
          <InspectionForm
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'view':
        if (!currentInspection) return null;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zařízení</h4>
                <p className="mt-1">{currentInspection.equipment_type} {currentInspection.model}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zákazník</h4>
                <p className="mt-1">{currentInspection.company_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Inspektor</h4>
                <p className="mt-1">{currentInspection.inspector_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Datum inspekce</h4>
                <p className="mt-1">{new Date(currentInspection.inspection_date).toLocaleDateString('cs-CZ')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Typ inspekce</h4>
                <p className="mt-1">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getInspectionTypeColor(currentInspection.inspection_type)}`}>
                    {currentInspection.inspection_type}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Příští inspekce</h4>
                <p className="mt-1">
                  {currentInspection.next_inspection_date 
                    ? new Date(currentInspection.next_inspection_date).toLocaleDateString('cs-CZ')
                    : "-"
                  }
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Zjištění</h4>
              <p className="mt-1">{currentInspection.findings || "-"}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Doporučení</h4>
              <p className="mt-1">{currentInspection.recommendations || "-"}</p>
            </div>
            
            <div className="flex justify-between pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleEditClick(currentInspection);
                }}
                className="btn btn-secondary"
              >
                Upravit
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-primary"
              >
                Zavřít
              </button>
            </div>
          </div>
        );
      case 'delete':
        return (
          <div>
            <p className="mb-4">
              Opravdu chcete smazat inspekci ze dne <strong>{currentInspection ? new Date(currentInspection.inspection_date).toLocaleDateString('cs-CZ') : ''}</strong>?
            </p>
            <p className="mb-6 text-sm text-red-600">Tato akce je nevratná.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-secondary"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Smazat
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Nadpis modálního okna podle režimu
  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Nová inspekce';
      case 'edit':
        return 'Upravit inspekci';
      case 'view':
        return 'Detail inspekce';
      case 'delete':
        return 'Smazat inspekci';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inspekce</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          Přidat inspekci
        </button>
      </div>

      {/* Zobrazení chyby */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Zobrazení načítání */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {inspections.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Žádné inspekce nebyly nalezeny</p>
              <button
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-800 underline"
                onClick={handleAddClick}
              >
                Přidat první inspekci
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zařízení
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspektor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum a typ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zjištění
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspections.map((inspection) => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{inspection.equipment_type}</div>
                      <div className="text-sm text-gray-500">{inspection.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inspection.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inspection.inspector_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(inspection.inspection_date).toLocaleDateString('cs-CZ')}</div>
                      <div className="text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getInspectionTypeColor(inspection.inspection_type)}`}
                        >
                          {inspection.inspection_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="text-sm text-gray-900">{inspection.findings || "-"}</div>
                      <div className="text-sm text-gray-500">{inspection.recommendations || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-blue-800 mr-3"
                        onClick={() => handleDetailClick(inspection)}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditClick(inspection)}
                      >
                        Upravit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(inspection)}
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modální okno pro operace s inspekcemi */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Inspections;