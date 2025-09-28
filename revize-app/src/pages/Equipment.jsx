import React, { useState, useEffect } from 'react';
import Modal from '../components/modals/Modal';
import EquipmentForm from '../components/forms/EquipmentForm';
import ConfigurationList from '../components/equipment/ConfigurationList';
import EquipmentFiles from '../components/equipment/EquipmentFiles';
import EquipmentHistoryTabs from '../components/equipment/EquipmentHistoryTabs';
import { getEquipmentForUser, createEquipment, updateEquipment, deleteEquipment } from '../services/equipmentService';
import { useAuth } from '../auth/AuthContext';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  const { currentUser } = useAuth();

  // Načtení zařízení
  useEffect(() => {
    fetchEquipment();
  }, [currentUser]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const data = await getEquipmentForUser(currentUser);
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání zařízení.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Otevření modálního okna pro přidání zařízení
  const handleAddClick = () => {
    setCurrentEquipment(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Otevření modálního okna pro úpravu zařízení
  const handleEditClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Otevření modálního okna pro zobrazení detailu zařízení
  const handleDetailClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('view');
    setModalOpen(true);
  };

  // Otevření modálního okna pro smazání zařízení
  const handleDeleteClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('delete');
    setModalOpen(true);
  };

  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Vytvoření nebo úprava zařízení
  const handleSubmit = async (values) => {
    try {
      let newEquipment;
      
      if (modalMode === 'create') {
        // Vytvoření nového zařízení a uložení odpovědi
        const response = await createEquipment(values);
        newEquipment = response;
      } else if (modalMode === 'edit') {
        // Aktualizace existujícího zařízení
        const response = await updateEquipment(currentEquipment.id, values);
        newEquipment = response;
      }
      
      // Aktualizace seznamu zařízení
      await fetchEquipment();
      
      // Zavření modálního okna
      handleCloseModal();
      
      // Pokud jde o nově vytvořené zařízení, otevřeme detail pro přidání konfigurace a souborů
      if (modalMode === 'create' && newEquipment) {
        setTimeout(() => {
          setCurrentEquipment(newEquipment);
          setModalMode('view');
          setModalOpen(true);
        }, 500); // Krátké zpoždění pro lepší UX
      }
    } catch (err) {
      setError('Nastala chyba při ukládání zařízení.');
      console.error(err);
    }
  };

  // Smazání zařízení
  const handleDelete = async () => {
    try {
      await deleteEquipment(currentEquipment.id);
      
      // Aktualizace seznamu zařízení
      fetchEquipment();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání zařízení.');
      console.error(err);
    }
  };

  // Navigace na detail zařízení s revizemi
  const navigateToRevisions = (equipmentId) => {
    // V budoucnu implementujeme navigaci na detail s revizemi
    console.log('Navigace na detail zařízení s revizemi:', equipmentId);
  };

  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
        return (
          <EquipmentForm
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'edit':
        return (
          <EquipmentForm
            initialValues={currentEquipment}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'view':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Zákazník</h4>
              <p className="mt-1">{currentEquipment?.company_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Typ zařízení</h4>
                <p className="mt-1">{currentEquipment?.equipment_type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Model</h4>
                <p className="mt-1">{currentEquipment?.model}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Výrobce</h4>
                <p className="mt-1">{currentEquipment?.manufacturer}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Rok výroby</h4>
                <p className="mt-1">{currentEquipment?.year_of_manufacture}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Výrobní číslo</h4>
                <p className="mt-1">{currentEquipment?.serial_number}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Inventární číslo</h4>
                <p className="mt-1">{currentEquipment?.inventory_number || "-"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Max. zatížení</h4>
                <p className="mt-1">{currentEquipment?.max_load || "-"} t</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Klasifikace</h4>
                <p className="mt-1">{currentEquipment?.classification || "-"}</p>
              </div>
            </div>
            
            {/* Seznam konfigurací zařízení */}
            <ConfigurationList equipmentId={currentEquipment?.id} />
            
            {/* Soubory a dokumentace zařízení */}
            <EquipmentFiles equipmentId={currentEquipment?.id} />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Poslední revize</h4>
                <p className="mt-1">
                  {currentEquipment?.last_revision_date 
                    ? new Date(currentEquipment.last_revision_date).toLocaleDateString('cs-CZ')
                    : "-"
                  }
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Příští revize</h4>
                <p className="mt-1">
                  {currentEquipment?.next_revision_date 
                    ? new Date(currentEquipment.next_revision_date).toLocaleDateString('cs-CZ')
                    : "-"
                  }
                </p>
              </div>
            </div>

            {/* Historie zařízení - revize, inspekce, servisní záznamy */}
            <EquipmentHistoryTabs equipmentId={currentEquipment?.id} />
            
            <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    handleEditClick(currentEquipment);
                  }}
                  className="btn btn-secondary"
                >
                  Upravit
                </button>
              </div>
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
            <p className="mb-4">Opravdu chcete smazat zařízení <strong>{currentEquipment?.equipment_type} {currentEquipment?.model}</strong>?</p>
            <p className="mb-6 text-sm text-red-600">Tato akce je nevratná a odstraní také všechny související revize, servisní výjezdy a inspekce.</p>
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
        return 'Nové zařízení';
      case 'edit':
        return 'Upravit zařízení';
      case 'view':
        return 'Detail zařízení';
      case 'delete':
        return 'Smazat zařízení';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zdvihací zařízení</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          Přidat zařízení
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
          {equipment.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Žádná zařízení nebyla nalezena</p>
              <button
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-800 underline"
                onClick={handleAddClick}
              >
                Přidat první zařízení
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
                    Parametry
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revize
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.equipment_type}</div>
                      <div className="text-sm text-gray-500">{item.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Max. nosnost: {item.max_load || "-"} t</div>
                      <div className="text-sm text-gray-500">Výr. č.: {item.serial_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Poslední: {item.last_revision_date 
                          ? new Date(item.last_revision_date).toLocaleDateString('cs-CZ')
                          : "-"
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        Příští: {item.next_revision_date 
                          ? new Date(item.next_revision_date).toLocaleDateString('cs-CZ')
                          : "-"
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-blue-800 mr-3"
                        onClick={() => handleDetailClick(item)}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditClick(item)}
                      >
                        Upravit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(item)}
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

      {/* Modální okno pro operace se zařízeními */}
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

export default Equipment;