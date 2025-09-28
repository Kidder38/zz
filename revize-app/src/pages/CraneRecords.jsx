import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import CraneRecordForm from '../components/forms/CraneRecordForm';
import { 
  getCraneRecords, 
  getEquipmentStatistics, 
  deleteCraneRecord,
  getRecordCategories,
  getRecordTypes 
} from '../services/craneRecordsService';
import { getEquipmentForUser } from '../services/equipmentService';
import { getCurrentLocation } from '../services/equipmentLocationService';
import { useAuth } from '../auth/AuthContext';

const CraneRecords = () => {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  
  // Filtry
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeType, setActiveType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const { currentUser } = useAuth();
  const recordCategories = getRecordCategories();
  const recordTypes = getRecordTypes();

  // Načtení dostupných zařízení
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getEquipmentForUser(currentUser);
        setEquipment(data);
        if (data.length > 0) {
          setSelectedEquipment(data[0]);
        }
      } catch (error) {
        console.error('Chyba při načítání zařízení:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [currentUser]);

  // Načtení záznamů a statistik pro vybrané zařízení
  useEffect(() => {
    if (!selectedEquipment) return;

    const fetchData = async () => {
      setRecordsLoading(true);
      try {
        // Sestavit parametry filtru
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (activeType !== 'all') params.type = activeType;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (dateRange.from) params.date_from = dateRange.from;
        if (dateRange.to) params.date_to = dateRange.to;

        // Načíst data paralelně
        const [recordsData, statsData, locationData] = await Promise.all([
          getCraneRecords(selectedEquipment.id, params),
          getEquipmentStatistics(selectedEquipment.id),
          getCurrentLocation(selectedEquipment.id)
        ]);

        setRecords(recordsData);
        setStatistics(statsData);
        setCurrentLocation(locationData);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchData();
  }, [selectedEquipment, activeCategory, activeType, statusFilter, dateRange]);

  // Handlers
  const handleCreateRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDeleteRecord = async (record) => {
    if (deleteConfirm === record.id) {
      try {
        await deleteCraneRecord(record.id);
        // Refresh data
        const params = {};
        if (activeCategory !== 'all') params.category = activeCategory;
        if (activeType !== 'all') params.type = activeType;
        
        const recordsData = await getCraneRecords(selectedEquipment.id, params);
        setRecords(recordsData);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Chyba při mazání záznamu:', error);
      }
    } else {
      setDeleteConfirm(record.id);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setShowForm(false);
      setEditingRecord(null);
      
      // Refresh data
      const params = {};
      if (activeCategory !== 'all') params.category = activeCategory;
      const recordsData = await getCraneRecords(selectedEquipment.id, params);
      setRecords(recordsData);
    } catch (error) {
      console.error('Chyba při obnovování dat:', error);
    }
  };

  // Helper funkce
  const getCategoryInfo = (category) => {
    return recordCategories.find(c => c.value === category) || 
           { label: category, icon: '📄', color: 'gray' };
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      planned: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      failed: 'bg-red-200 text-red-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getResultColor = (result) => {
    const colors = {
      passed: 'text-green-600',
      passed_with_remarks: 'text-yellow-600',
      failed: 'text-red-600',
      not_applicable: 'text-gray-600'
    };
    return colors[result] || 'text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  if (loading) {
    return <div className="text-center py-8">Načítání...</div>;
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Žádná zařízení</h2>
        <p className="text-gray-600 mb-4">Nemáte přístup k žádným zařízením.</p>
        <Link
          to="/equipment"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Přejít na zařízení
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Provozní záznamy</h1>
        <p className="mt-2 text-sm text-gray-700">
          Kompletní evidence kontrol, revizí, údržby a incidentů podle NV 193/2022
        </p>
      </div>

      {/* Equipment Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Vyberte zařízení</h2>
          <button
            onClick={handleCreateRecord}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nový záznam
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipment.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedEquipment(item)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedEquipment?.id === item.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {item.manufacturer} {item.model}
                  </h3>
                  <p className="text-sm text-gray-600">{item.equipment_type}</p>
                  <p className="text-sm text-gray-500">{item.company_name}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    item.current_status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.current_status || 'stored'}
                  </span>
                </div>
              </div>
              
              {/* Aktuální umístění */}
              {currentLocation && selectedEquipment?.id === item.id && (
                <div className="mt-2 text-sm text-gray-500">
                  📍 {currentLocation.location_name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedEquipment && (
        <>
          {/* Statistiky */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Celkem záznamů</dt>
                        <dd className="text-lg font-medium text-gray-900">{statistics.total_records}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Úspěšné kontroly</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {(statistics.by_result?.passed || 0) + (statistics.by_result?.passed_with_remarks || 0)}
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Vyžaduje údržbu</dt>
                        <dd className="text-lg font-medium text-gray-900">{statistics.alerts?.maintenance_required || 0}</dd>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Problémy</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {(statistics.alerts?.overdue_controls || 0) + (statistics.alerts?.failed_controls || 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtry */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filtry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Kategorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie</label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Vše</option>
                  {recordCategories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Typ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
                <select
                  value={activeType}
                  onChange={(e) => setActiveType(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Vše</option>
                  {recordTypes
                    .filter(type => activeCategory === 'all' || type.category === activeCategory)
                    .map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Stav */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stav</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="all">Vše</option>
                  <option value="completed">Dokončeno</option>
                  <option value="in_progress">Probíhá</option>
                  <option value="planned">Plánováno</option>
                  <option value="overdue">Po termínu</option>
                </select>
              </div>

              {/* Datum od-do */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Období</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Od"
                  />
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Do"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Seznam záznamů */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Záznamy - {selectedEquipment.manufacturer} {selectedEquipment.model}
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {recordsLoading ? (
                <div className="p-6 text-center">Načítání záznamů...</div>
              ) : records.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Žádné záznamy pro vybraná kritéria
                </div>
              ) : (
                records.map((record) => {
                  const categoryInfo = getCategoryInfo(record.record_category);
                  
                  return (
                    <div key={record.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${categoryInfo.color}-100 text-${categoryInfo.color}-800`}>
                              {categoryInfo.icon} {categoryInfo.label}
                            </span>
                            
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                            
                            {record.result && (
                              <span className={`text-sm font-medium ${getResultColor(record.result)}`}>
                                {record.result.replace('_', ' ').toUpperCase()}
                              </span>
                            )}
                            
                            <span className="text-sm text-gray-500">
                              {formatDate(record.record_date)} {formatTime(record.record_time)}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            {record.title}
                          </h3>
                          
                          {record.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {record.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Provedl: {record.inspector_name}</span>
                            {record.operating_hours && (
                              <span>Motohodiny: {record.operating_hours}h</span>
                            )}
                            {record.location_name && (
                              <span>📍 {record.location_name}</span>
                            )}
                          </div>

                          {record.findings && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Zjištění: </span>
                              <span className="text-gray-600">{record.findings}</span>
                            </div>
                          )}

                          {record.recommendations && (
                            <div className="mt-1 text-sm">
                              <span className="font-medium text-gray-700">Doporučení: </span>
                              <span className="text-gray-600">{record.recommendations}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/crane-records/${record.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Detail
                          </Link>
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                          >
                            Upravit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record)}
                            className={`text-sm font-medium ${
                              deleteConfirm === record.id
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            {deleteConfirm === record.id ? 'Potvrdit smazání' : 'Smazat'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal pro formulář */}
      <Modal
        isOpen={showForm}
        title={editingRecord ? 'Upravit záznam' : 'Nový záznam'}
        onClose={() => {
          setShowForm(false);
          setEditingRecord(null);
        }}
      >
        <CraneRecordForm
          initialValues={editingRecord}
          selectedEquipment={selectedEquipment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default CraneRecords;