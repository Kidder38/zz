import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import CustomerForm from '../components/forms/CustomerForm';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customerService';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'

  // Načtení zákazníků
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomers();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání zákazníků.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Otevření modálního okna pro vytvoření zákazníka
  const handleAddClick = () => {
    setCurrentCustomer(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Otevření modálního okna pro úpravu zákazníka
  const handleEditClick = (customer) => {
    setCurrentCustomer(customer);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Otevření modálního okna pro detail zákazníka
  const handleDetailClick = (customer) => {
    setCurrentCustomer(customer);
    setModalMode('view');
    setModalOpen(true);
  };

  // Otevření modálního okna pro smazání zákazníka
  const handleDeleteClick = (customer) => {
    setCurrentCustomer(customer);
    setModalMode('delete');
    setModalOpen(true);
  };

  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Vytvoření nebo úprava zákazníka
  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'create') {
        await createCustomer(values);
      } else if (modalMode === 'edit') {
        await updateCustomer(currentCustomer.id, values);
      }
      
      // Aktualizace seznamu zákazníků
      fetchCustomers();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při ukládání zákazníka.');
      console.error(err);
    }
  };

  // Smazání zákazníka
  const handleDelete = async () => {
    try {
      await deleteCustomer(currentCustomer.id);
      
      // Aktualizace seznamu zákazníků
      fetchCustomers();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání zákazníka.');
      console.error(err);
    }
  };

  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
        return (
          <CustomerForm
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'edit':
        return (
          <CustomerForm
            initialValues={currentCustomer}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'view':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Název společnosti</h4>
                <p className="mt-1">{currentCustomer?.company_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">IČ / DIČ</h4>
                <p className="mt-1">
                  {currentCustomer?.ico ? `IČ: ${currentCustomer.ico}` : ''} 
                  {currentCustomer?.dic ? `, DIČ: ${currentCustomer.dic}` : ''}
                  {!currentCustomer?.ico && !currentCustomer?.dic && "-"}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Adresa</h4>
              <p className="mt-1">{currentCustomer?.street}</p>
              <p>{currentCustomer?.postal_code} {currentCustomer?.city}</p>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Kontaktní osoby</h4>
              {currentCustomer?.contact_persons && currentCustomer.contact_persons.length > 0 ? (
                <div className="space-y-4">
                  {currentCustomer.contact_persons.map((person, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-md">
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-sm text-gray-600">{person.email || "-"}</p>
                      <p className="text-sm text-gray-600">{person.phone || "-"}</p>
                    </div>
                  ))}
                </div>
              ) : currentCustomer?.contact_person ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium text-sm">{currentCustomer.contact_person}</p>
                  <p className="text-sm text-gray-600">{currentCustomer.email || "-"}</p>
                  <p className="text-sm text-gray-600">{currentCustomer.phone || "-"}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Žádné kontaktní osoby</p>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  handleEditClick(currentCustomer);
                }}
                className="px-4 py-2 text-sm font-medium text-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Upravit
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Zavřít
              </button>
            </div>
          </div>
        );
      case 'delete':
        return (
          <div>
            <p className="mb-4">Opravdu chcete smazat zákazníka <strong>{currentCustomer?.company_name}</strong>?</p>
            <p className="mb-6 text-sm text-red-600">Tato akce je nevratná.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
        return 'Nový zákazník';
      case 'edit':
        return 'Upravit zákazníka';
      case 'view':
        return 'Detail zákazníka';
      case 'delete':
        return 'Smazat zákazníka';
      default:
        return '';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Zákazníci</h1>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
          onClick={handleAddClick}
        >
          Přidat zákazníka
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
          {customers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Žádní zákazníci nebyli nalezeni</p>
              <button
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-800 underline"
                onClick={handleAddClick}
              >
                Přidat prvního zákazníka
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Společnost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IČ / DIČ
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresa
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontaktní osoby
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{customer.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.ico ? `IČ: ${customer.ico}` : ''}
                        {customer.dic ? <span className="ml-1">DIČ: {customer.dic}</span> : ''}
                        {!customer.ico && !customer.dic && "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.street}</div>
                      <div className="text-sm text-gray-500">{customer.postal_code} {customer.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.contact_persons && customer.contact_persons.length > 0 ? (
                        <div>
                          <div className="text-sm text-gray-900">{customer.contact_persons[0].name}</div>
                          {customer.contact_persons.length > 1 && (
                            <div className="text-xs text-gray-500">+ {customer.contact_persons.length - 1} další</div>
                          )}
                        </div>
                      ) : customer.contact_person ? (
                        <div className="text-sm text-gray-900">{customer.contact_person}</div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-blue-800 mr-3"
                        onClick={() => handleDetailClick(customer)}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-900 mr-3"
                        onClick={() => handleEditClick(customer)}
                      >
                        Upravit
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(customer)}
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

      {/* Modální okno pro operace se zákazníky */}
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

export default Customers;