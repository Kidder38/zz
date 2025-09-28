import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import OperatorForm from '../components/forms/OperatorForm';
import { getOperators, deleteOperator } from '../services/operatorService';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../auth/roles';

const Operators = () => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOperator, setEditingOperator] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { currentUser } = useAuth();

  const canCreate = hasPermission(currentUser?.role, 'operators', 'create');
  const canEdit = hasPermission(currentUser?.role, 'operators', 'edit');
  const canDelete = hasPermission(currentUser?.role, 'operators', 'delete');

  // Debug oprávnění
  console.log('Aktuální uživatel:', currentUser);
  console.log('Role uživatele:', currentUser?.role);
  console.log('Může vytvářet obsluhu:', canCreate);
  console.log('Může upravovat obsluhu:', canEdit);
  console.log('Může mazat obsluhu:', canDelete);

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    console.log('showForm změněno na:', showForm);
  }, [showForm]);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const data = await getOperators();
      setOperators(data);
    } catch (error) {
      console.error('Chyba při načítání obsluhy:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('handleCreate byla zavolána!');
    console.log('canCreate:', canCreate);
    console.log('showForm před změnou:', showForm);
    setEditingOperator(null);
    setShowForm(true);
    console.log('setShowForm(true) byla zavolána');
  };

  const handleEdit = (operator) => {
    setEditingOperator(operator);
    setShowForm(true);
  };

  const handleFormSubmit = async () => {
    try {
      console.log('Formulář byl odeslán, zavírám modal a obnovujem seznam...');
      setShowForm(false);
      setEditingOperator(null);
      await fetchOperators();
      console.log('Seznam obsluhy byl úspěšně obnoven');
    } catch (error) {
      console.error('Chyba při obnovování seznamu obsluhy:', error);
    }
  };

  const handleDelete = async (operator) => {
    if (deleteConfirm === operator.id) {
      try {
        await deleteOperator(operator.id);
        await fetchOperators();
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Chyba při mazání obsluhy:', error);
      }
    } else {
      setDeleteConfirm(operator.id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const isCertificationExpiring = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    const daysDiff = (expiryDate - today) / (1000 * 60 * 60 * 24);
    return daysDiff <= 30 && daysDiff >= 0; // Expiring in 30 days
  };

  const isCertificationExpired = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    return expiryDate < today;
  };

  if (loading) {
    return <div className="text-center py-8">Načítání...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obsluha zařízení</h1>
          <p className="mt-2 text-sm text-gray-700">
            Správa osob oprávněných k obsluze zdvihacích zařízení
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Kliknutí na tlačítko detekováno!');
              handleCreate();
            }}
            onMouseDown={() => console.log('Mouse down na tlačítku')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            style={{ zIndex: 1000 }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Přidat obsluhu
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkem obsluhy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {operators.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Brzy expirující certifikáty
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {operators.filter(op => isCertificationExpiring(op.certification_valid_until)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 4h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17.294 15m-3.294-5a2 2 0 012-2h5a2 2 0 012 2v6.5a2 2 0 01-2 2h-5a2 2 0 01-2-2V10z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expirované certifikáty
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {operators.filter(op => isCertificationExpired(op.certification_valid_until)).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operators Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Seznam obsluhy
          </h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {operators.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Žádná obsluha není evidována
            </div>
          ) : (
            operators.map((operator) => {
              const certExpiring = isCertificationExpiring(operator.certification_valid_until);
              const certExpired = isCertificationExpired(operator.certification_valid_until);
              
              return (
                <li key={operator.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {operator.first_name.charAt(0)}{operator.last_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {operator.first_name} {operator.last_name}
                            </p>
                            {operator.operator_card_number && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Karta: {operator.operator_card_number}
                              </span>
                            )}
                            {certExpired && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Certifikát expirován
                              </span>
                            )}
                            {certExpiring && !certExpired && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Certifikát brzy expiruje
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              {operator.certification_valid_until && (
                                <span>Certifikát do: {formatDate(operator.certification_valid_until)}</span>
                              )}
                              {operator.phone && (
                                <span>Tel: {operator.phone}</span>
                              )}
                              {operator.email && (
                                <span>Email: {operator.email}</span>
                              )}
                            </div>
                          </div>
                          {operator.assigned_equipment && operator.assigned_equipment.length > 0 && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-600">
                                Přiřazená zařízení: {operator.assigned_equipment.map(eq => 
                                  `${eq.manufacturer} ${eq.model}`
                                ).join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/logbook?user=${operator.id}`}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Historie
                      </Link>
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(operator)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Upravit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(operator)}
                          className={`text-sm font-medium ${
                            deleteConfirm === operator.id
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          {deleteConfirm === operator.id ? 'Potvrdit smazání' : 'Smazat'}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>

      {/* Operator Form Modal */}
      <Modal
        isOpen={showForm}
        title={editingOperator ? 'Upravit obsluhu' : 'Přidat obsluhu'}
        onClose={() => {
          console.log('Modal se zavírá...');
          setShowForm(false);
          setEditingOperator(null);
        }}
      >
          <OperatorForm
            initialValues={editingOperator}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingOperator(null);
            }}
          />
        </Modal>
    </div>
  );
};

export default Operators;