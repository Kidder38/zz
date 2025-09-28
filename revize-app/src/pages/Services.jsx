import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import ServiceVisitForm from '../components/forms/ServiceVisitForm';
import { 
  getServiceVisits, 
  getServiceVisitById, 
  createServiceVisit, 
  updateServiceVisit, 
  deleteServiceVisit
} from '../services/serviceService';

const Services = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  const [initialEquipmentId, setInitialEquipmentId] = useState(null);

  // Načtení servisních výjezdů
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Zpracování navigačního stavu - otevření detailu nebo vytvoření nového servisu
  useEffect(() => {
    const handleLocationState = async () => {
      // Pokud existuje location.state, zpracujeme ho
      if (location.state) {
        // Pokud přecházíme z detailu zařízení a máme viewId, načteme a zobrazíme servis
        if (location.state.viewId) {
          try {
            setIsLoading(true);
            const service = await getServiceVisitById(location.state.viewId);
            setCurrentService(service);
            setModalMode('view');
            setModalOpen(true);
          } catch (err) {
            console.error('Chyba při načítání servisního záznamu:', err);
            setError('Nepodařilo se načíst detail servisního záznamu.');
          } finally {
            setIsLoading(false);
          }
        }
        // Pokud chceme vytvořit nový servis a máme equipmentId
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

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await getServiceVisits();
      setServices(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání servisních výjezdů.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Otevření modálního okna pro vytvoření servisního výjezdu
  const handleAddClick = () => {
    setCurrentService(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Otevření modálního okna pro úpravu servisního výjezdu
  const handleEditClick = (service) => {
    setCurrentService(service);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Otevření modálního okna pro detail servisního výjezdu
  const handleDetailClick = (service) => {
    setCurrentService(service);
    setModalMode('view');
    setModalOpen(true);
  };

  // Otevření modálního okna pro smazání servisního výjezdu
  const handleDeleteClick = (service) => {
    setCurrentService(service);
    setModalMode('delete');
    setModalOpen(true);
  };

  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Vytvoření nebo úprava servisního výjezdu
  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'create') {
        await createServiceVisit(values);
      } else if (modalMode === 'edit') {
        await updateServiceVisit(currentService.id, values);
      }
      
      // Aktualizace seznamu servisních výjezdů
      fetchServices();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při ukládání servisního výjezdu.');
      console.error(err);
    }
  };

  // Smazání servisního výjezdu
  const handleDelete = async () => {
    try {
      await deleteServiceVisit(currentService.id);
      
      // Aktualizace seznamu servisních výjezdů
      fetchServices();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání servisního výjezdu.');
      console.error(err);
    }
  };

  // Formátování ceny
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
  };

  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
      case 'edit':
        // Při vytváření nového servisu můžeme mít předvyplněné ID zařízení, pokud přicházíme ze stránky zařízení
        const formInitialValues = modalMode === 'edit' 
          ? currentService 
          : initialEquipmentId 
            ? { equipment_id: initialEquipmentId } 
            : null;
            
        return (
          <ServiceVisitForm
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'view':
        if (!currentService) return null;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zařízení</h4>
                <p className="mt-1">{currentService.equipment_type} {currentService.model}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zákazník</h4>
                <p className="mt-1">{currentService.company_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Technik</h4>
                <p className="mt-1">{currentService.technician_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Datum návštěvy</h4>
                <p className="mt-1">{new Date(currentService.visit_date).toLocaleDateString('cs-CZ')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Odpracované hodiny</h4>
                <p className="mt-1">{currentService.hours_worked} hod.</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Náklady</h4>
                <p className="mt-1">{currentService.cost ? formatCurrency(currentService.cost) : "-"}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Popis prací</h4>
              <p className="mt-1">{currentService.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Použité díly</h4>
              <p className="mt-1">{currentService.parts_used || "-"}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Fakturace</h4>
              <p className="mt-1">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                  currentService.invoiced 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentService.invoiced 
                    ? `Fakturováno (${currentService.invoice_number})` 
                    : 'Nefakturováno'
                  }
                </span>
              </p>
            </div>
            
            {currentService.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Poznámky</h4>
                <p className="mt-1">{currentService.notes}</p>
              </div>
            )}
            
            <div className="flex justify-between pt-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleEditClick(currentService);
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
              Opravdu chcete smazat servisní výjezd ze dne <strong>{currentService ? new Date(currentService.visit_date).toLocaleDateString('cs-CZ') : ''}</strong>?
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
        return 'Nový servisní výjezd';
      case 'edit':
        return 'Upravit servisní výjezd';
      case 'view':
        return 'Detail servisního výjezdu';
      case 'delete':
        return 'Smazat servisní výjezd';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Servisní výjezdy</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          Přidat servisní výjezd
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
          {services.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Žádné servisní výjezdy nebyly nalezeny</p>
              <button
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-800 underline"
                onClick={handleAddClick}
              >
                Přidat první servisní výjezd
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
                    Technik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popis práce
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fakturace
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.equipment_type}</div>
                      <div className="text-sm text-gray-500">{service.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.technician_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(service.visit_date).toLocaleDateString('cs-CZ')}</div>
                      <div className="text-sm text-gray-500">{service.hours_worked} hod.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                      <div className="text-sm text-gray-900">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          service.invoiced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {service.invoiced 
                          ? `Fakturováno (${service.invoice_number})` 
                          : 'Nefakturováno'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-blue-800 mr-3"
                        onClick={() => handleDetailClick(service)}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditClick(service)}
                      >
                        Upravit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(service)}
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

      {/* Modální okno pro operace se servisními výjezdy */}
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

export default Services;