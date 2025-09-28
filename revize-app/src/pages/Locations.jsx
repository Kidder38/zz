import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import LocationForm from '../components/forms/LocationForm';
import EquipmentLocationHistory from '../components/equipment/EquipmentLocationHistory';
import { 
  getLocations, 
  deleteLocation, 
  getLocationTypes,
  getEquipmentAtLocation 
} from '../services/locationService';
import { getAllEquipmentLocations } from '../services/equipmentLocationService';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../auth/roles';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [equipmentOverview, setEquipmentOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('locations'); // 'locations', 'equipment_overview'
  
  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  // Filtry
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { currentUser } = useAuth();
  const locationTypes = getLocationTypes();
  
  const canCreate = hasPermission(currentUser?.role, 'equipment', 'create');
  const canEdit = hasPermission(currentUser?.role, 'equipment', 'edit');
  const canDelete = hasPermission(currentUser?.role, 'equipment', 'delete');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [locationsData, equipmentData] = await Promise.all([
        getLocations(),
        getAllEquipmentLocations()
      ]);
      setLocations(locationsData);
      setEquipmentOverview(equipmentData);
    } catch (error) {
      console.error('Chyba při načítání dat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (location) => {
    if (deleteConfirm === location.id) {
      try {
        await deleteLocation(location.id);
        await fetchData();
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Chyba při mazání lokace:', error);
      }
    } else {
      setDeleteConfirm(location.id);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setShowForm(false);
      setEditingLocation(null);
      await fetchData();
    } catch (error) {
      console.error('Chyba při obnovování dat:', error);
    }
  };

  const handleShowEquipmentHistory = (equipment) => {
    setSelectedEquipment(equipment);
    setShowHistory(true);
  };

  // Helper funkce
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

  // Filtrované lokace
  const filteredLocations = locations.filter(location => {
    if (typeFilter !== 'all' && location.location_type !== typeFilter) return false;
    return true;
  });

  // Filtrovaný přehled zařízení
  const filteredEquipment = equipmentOverview.filter(equipment => {
    if (typeFilter !== 'all' && equipment.current_location_type !== typeFilter) return false;
    if (statusFilter !== 'all' && equipment.current_status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-8">Načítání...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Umístění a lokace</h1>
        <p className="mt-2 text-sm text-gray-700">
          Správa staveb, skladů a historie umístění jeřábů
        </p>
      </div>

      {/* Taby */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('locations')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'locations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📍 Lokace ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('equipment_overview')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'equipment_overview'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏗️ Přehled jeřábů ({equipmentOverview.length})
          </button>
        </nav>
      </div>

      {/* Filtry */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {activeTab === 'equipment_overview' && (
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
          )}

          <div className="flex items-end">
            {canCreate && activeTab === 'locations' && (
              <button
                onClick={handleCreateLocation}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nová lokace
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'locations' ? (
        /* Seznam lokací */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Lokace a stavby
            </h2>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Žádné lokace pro vybraná kritéria
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredLocations.map((location) => {
                const typeInfo = getLocationTypeInfo(location.location_type);
                
                return (
                  <div key={location.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {location.location_name}
                            </h3>
                            <p className="text-sm text-gray-500">{typeInfo.label}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Adresa</p>
                            <p className="text-sm text-gray-600">
                              {location.address || '-'}
                            </p>
                            <p className="text-sm text-gray-600">{location.city}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Kontakt</p>
                            <p className="text-sm text-gray-600">{location.contact_person || '-'}</p>
                            <p className="text-sm text-gray-600">{location.contact_phone || '-'}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700">Aktivní</p>
                            <p className="text-sm text-gray-600">
                              Od: {formatDate(location.active_from)}
                            </p>
                            {location.planned_completion && (
                              <p className="text-sm text-gray-600">
                                Do: {formatDate(location.planned_completion)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/locations/${location.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          Detail
                        </Link>
                        {canEdit && (
                          <button
                            onClick={() => handleEditLocation(location)}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                          >
                            Upravit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteLocation(location)}
                            className={`text-sm font-medium ${
                              deleteConfirm === location.id
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            {deleteConfirm === location.id ? 'Potvrdit smazání' : 'Smazat'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Přehled umístění jeřábů */
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
                const hasAlerts = equipment.alerts.daily_control_missing || 
                                equipment.alerts.revision_due_soon || 
                                equipment.alerts.maintenance_required;
                
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
                            {equipment.alerts.daily_control_missing && (
                              <p className="text-sm text-red-600">• Chybí denní kontrola</p>
                            )}
                            {equipment.alerts.revision_due_soon && (
                              <p className="text-sm text-yellow-600">• Blížící se revize</p>
                            )}
                            {equipment.alerts.maintenance_required && (
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

      {/* Modal pro formulář lokace */}
      <Modal
        isOpen={showForm}
        title={editingLocation ? 'Upravit lokaci' : 'Nová lokace'}
        onClose={() => {
          setShowForm(false);
          setEditingLocation(null);
        }}
      >
        <LocationForm
          initialValues={editingLocation}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingLocation(null);
          }}
        />
      </Modal>

      {/* Modal pro historii umístění */}
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

export default Locations;