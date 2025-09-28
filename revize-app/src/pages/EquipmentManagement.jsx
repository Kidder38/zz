import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import EquipmentForm from '../components/forms/EquipmentForm';
import LocationForm from '../components/forms/LocationForm';
import ConfigurationList from '../components/equipment/ConfigurationList';
import EquipmentFiles from '../components/equipment/EquipmentFiles';
import EquipmentHistoryTabs from '../components/equipment/EquipmentHistoryTabs';
import EquipmentLocationHistory from '../components/equipment/EquipmentLocationHistory';
import { getEquipmentForUser, createEquipment, updateEquipment, deleteEquipment } from '../services/equipmentService';
import { getLocationTypes } from '../services/locationService';
import { getAllEquipmentLocations } from '../services/equipmentLocationService';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../auth/roles';

const EquipmentManagement = () => {
  const location = useLocation();
  // Set initial tab based on route - if accessing via /locations, start with locations tab
  const initialTab = location.pathname === '/locations' ? 'locations' : 'equipment';
  const [activeTab, setActiveTab] = useState(initialTab); // 'equipment', 'locations', 'overview'
  
  // Equipment state
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  
  // Overview state
  const [equipmentOverview, setEquipmentOverview] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { currentUser } = useAuth();
  const locationTypes = getLocationTypes();
  
  const canCreate = hasPermission(currentUser?.role, 'equipment', 'create');
  const canEdit = hasPermission(currentUser?.role, 'equipment', 'edit');
  const canDelete = hasPermission(currentUser?.role, 'equipment', 'delete');
  

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [equipmentData, overviewData] = await Promise.all([
        getEquipmentForUser(currentUser),
        getAllEquipmentLocations()
      ]);
      setEquipment(equipmentData);
      setEquipmentOverview(overviewData);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání dat.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Equipment handlers
  const handleAddClick = () => {
    setCurrentEquipment(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDetailClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setCurrentEquipment(item);
    setModalMode('delete');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (values) => {
    try {
      let newEquipment;
      
      if (modalMode === 'create') {
        const response = await createEquipment(values);
        newEquipment = response;
      } else if (modalMode === 'edit') {
        const response = await updateEquipment(currentEquipment.id, values);
        newEquipment = response;
      }
      
      await fetchAllData();
      handleCloseModal();
      
      if (modalMode === 'create' && newEquipment) {
        setTimeout(() => {
          setCurrentEquipment(newEquipment);
          setModalMode('view');
          setModalOpen(true);
        }, 500);
      }
    } catch (err) {
      setError('Nastala chyba při ukládání zařízení.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEquipment(currentEquipment.id);
      fetchAllData();
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání zařízení.');
      console.error(err);
    }
  };


  const handleShowEquipmentHistory = (equipment) => {
    setSelectedEquipment(equipment);
    setShowHistory(true);
  };

  // Helper functions
  const getLocationTypeInfo = (type) => {
    return locationTypes.find(t => t.value === type) || 
           { label: type, icon: '📍' };
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      stored: 'bg-gray-100 text-gray-800',
      in_transport: 'bg-blue-100 text-blue-800',
      mounting: 'bg-yellow-100 text-yellow-800',
      dismounting: 'bg-orange-100 text-orange-800',
      maintenance: 'bg-purple-100 text-purple-800',
      retired: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('cs-CZ') : '-';
  };

  // Filtered data
  const filteredEquipment = equipmentOverview.filter(equipment => {
    if (typeFilter !== 'all' && equipment.current_location_type !== typeFilter) return false;
    if (statusFilter !== 'all' && equipment.current_status !== statusFilter) return false;
    return true;
  });

  // Modal content renderer
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
          <div className="space-y-6">
            {/* Equipment Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🏗️</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentEquipment?.manufacturer} {currentEquipment?.model}
                  </h2>
                  <p className="text-gray-600">{currentEquipment?.serial_number}</p>
                  <p className="text-sm text-gray-500">{currentEquipment?.company_name}</p>
                </div>
              </div>
            </div>

            {/* Technické údaje */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Technické údaje</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Výrobce</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.manufacturer}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Model</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.model}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Sér. číslo</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.serial_number}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rok výroby</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.year_of_manufacture || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Nosnost</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.max_load || 'N/A'} t</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Inventární číslo</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.inventory_number || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Klasifikace</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.classification || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Typ zařízení</h4>
                  <p className="mt-1 font-medium">{currentEquipment?.equipment_type}</p>
                </div>
              </div>
            </div>

            {/* Revize */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">📋 Revize</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-500">Poslední revize</h4>
                  <p className="mt-1 font-medium">
                    {currentEquipment?.last_revision_date 
                      ? new Date(currentEquipment.last_revision_date).toLocaleDateString('cs-CZ')
                      : "N/A"
                    }
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-500">Příští revize</h4>
                  <p className="mt-1 font-medium">
                    {currentEquipment?.next_revision_date 
                      ? new Date(currentEquipment.next_revision_date).toLocaleDateString('cs-CZ')
                      : "N/A"
                    }
                  </p>
                </div>
              </div>
            </div>

            <ConfigurationList equipmentId={currentEquipment?.id} />
            <EquipmentFiles equipmentId={currentEquipment?.id} />
            <EquipmentHistoryTabs equipmentId={currentEquipment?.id} />
            
            {/* Actions */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <Link
                  to={`/equipment/${currentEquipment?.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
                >
                  <span className="mr-2">📊</span>
                  Zobrazit úplný detail
                </Link>
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Správa zařízení</h1>
        <p className="mt-2 text-sm text-gray-700">
          Kompletní správa zdvihacích zařízení a přehled jejich umístění
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'equipment'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏗️ Zařízení ({equipment.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏗️ Stavby
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Přehled umístění ({equipmentOverview.length})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {activeTab === 'overview' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ lokace
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Všechny typy</option>
                  {locationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stav jeřábu
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Všechny stavy</option>
                  <option value="operational">V provozu</option>
                  <option value="stored">Skladem</option>
                  <option value="in_transport">V přepravě</option>
                  <option value="mounting">Montáž</option>
                  <option value="maintenance">Údržba</option>
                </select>
              </div>
            </>
          )}

          <div className="flex items-end">
            {canCreate && activeTab === 'equipment' && (
              <button
                onClick={handleAddClick}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nové zařízení
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'equipment' && (
        <div>
          {equipment.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
              <div className="text-6xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Žádná zařízení
              </h3>
              <p className="mb-4">Žádná zařízení nebyla nalezena</p>
              {canCreate && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  onClick={handleAddClick}
                >
                  Přidat první zařízení
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((item) => (
                <div
                  key={item.id}
                  className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-6">
                    {/* Equipment Header */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="text-3xl">🏗️</div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.manufacturer} {item.model}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {item.serial_number}
                        </p>
                      </div>
                    </div>

                    {/* Equipment Info */}
                    <div className="space-y-3 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Zákazník</span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.company_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Typ</span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.equipment_type}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Max. nosnost</span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.max_load || "N/A"} t
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Revisions */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">📋 Revize</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-blue-50 rounded p-2">
                          <div className="text-gray-500">Poslední</div>
                          <div className="font-medium text-gray-900">
                            {item.last_revision_date 
                              ? new Date(item.last_revision_date).toLocaleDateString('cs-CZ')
                              : "N/A"
                            }
                          </div>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <div className="text-gray-500">Příští</div>
                          <div className="font-medium text-gray-900">
                            {item.next_revision_date 
                              ? new Date(item.next_revision_date).toLocaleDateString('cs-CZ')
                              : "N/A"
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Link
                        to={`/equipment/${item.id}`}
                        className="bg-blue-600 text-white text-sm px-3 py-2 rounded hover:bg-blue-700 text-center"
                      >
                        📊 Zobrazit detail
                      </Link>
                      
                      <div className="flex space-x-2">
                        <button 
                          className="flex-1 bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded hover:bg-gray-200"
                          onClick={() => handleDetailClick(item)}
                        >
                          Detail
                        </button>
                        {canEdit && (
                          <button 
                            className="flex-1 bg-gray-100 text-gray-700 text-sm px-3 py-2 rounded hover:bg-gray-200"
                            onClick={() => handleEditClick(item)}
                          >
                            Upravit
                          </button>
                        )}
                        {canDelete && (
                          <button 
                            className="flex-1 bg-red-100 text-red-700 text-sm px-3 py-2 rounded hover:bg-red-200"
                            onClick={() => handleDeleteClick(item)}
                          >
                            Smazat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'locations' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Stavby a projekty
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Přehled všech staveb s přiřazenými jeřáby
            </p>
          </div>

          <div className="p-6">
            <div className="text-center text-gray-500">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2 0h-4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Správa staveb přesunuta
              </h3>
              <p className="text-gray-600 mb-4">
                Funkce správy lokací byla přesunuta do dedikované sekce staveb pro lepší organizaci.
              </p>
              <Link
                to="/projects"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-2 0H3m2 0h-4" />
                </svg>
                Přejít na správu staveb
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Přehled umístění jeřábů
            </h2>
          </div>

          {filteredEquipment.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Žádné jeřáby pro vybraná kritéria
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEquipment.map((equipment) => {
                const hasAlerts = equipment.alerts?.daily_control_missing || 
                                equipment.alerts?.revision_due_soon || 
                                equipment.alerts?.maintenance_required;
                
                return (
                  <div key={equipment.equipment_id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {equipment.manufacturer} {equipment.model}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {equipment.equipment_type} • SN: {equipment.serial_number}
                            </p>
                          </div>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(equipment.current_status)}`}>
                            {equipment.current_status}
                          </span>
                          
                          {hasAlerts && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ⚠️ Upozornění
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Aktuální umístění</p>
                            <p className="text-sm text-gray-600">{equipment.current_location_name}</p>
                            <p className="text-sm text-gray-500">
                              Od: {formatDate(equipment.installed_since)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Odpovědná osoba</p>
                            <p className="text-sm text-gray-600">{equipment.responsible_person || '-'}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Provoz</p>
                            <p className="text-sm text-gray-600">{equipment.operating_hours}h</p>
                            <p className="text-sm text-gray-500">
                              Kontrola: {formatDate(equipment.last_control_date)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Upozornění</p>
                            {equipment.alerts?.daily_control_missing && (
                              <p className="text-sm text-red-600">• Chybí denní kontrola</p>
                            )}
                            {equipment.alerts?.revision_due_soon && (
                              <p className="text-sm text-yellow-600">• Blížící se revize</p>
                            )}
                            {equipment.alerts?.maintenance_required && (
                              <p className="text-sm text-orange-600">• Nutná údržba</p>
                            )}
                            {!hasAlerts && (
                              <p className="text-sm text-green-600">• Bez upozornění</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/equipment/${equipment.equipment_id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Detail
                        </Link>
                        <button
                          onClick={() => handleShowEquipmentHistory(equipment)}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Historie
                        </button>
                        <Link
                          to={`/crane-records?equipment=${equipment.equipment_id}`}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          Záznamy
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Equipment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={getModalTitle()}
        size={modalMode === 'view' ? 'xl' : 'lg'}
      >
        {renderModalContent()}
      </Modal>


      {/* Equipment History Modal */}
      <Modal
        isOpen={showHistory}
        title={`Historie umístění - ${selectedEquipment?.manufacturer} ${selectedEquipment?.model}`}
        onClose={() => {
          setShowHistory(false);
          setSelectedEquipment(null);
        }}
      >
        {selectedEquipment && (
          <EquipmentLocationHistory 
            equipmentId={selectedEquipment.equipment_id}
            onClose={() => {
              setShowHistory(false);
              setSelectedEquipment(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default EquipmentManagement;