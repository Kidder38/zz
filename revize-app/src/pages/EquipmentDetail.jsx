import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { getEquipmentItem } from '../services/equipmentService';
import { getCraneRecords } from '../services/craneRecordsService';
import { getCurrentLocation, getCurrentProject, getEquipmentLocationHistory } from '../services/equipmentLocationService';
import Modal from '../components/modals/Modal';
import ControlChecklistForm from '../components/controls/ControlChecklistForm';
import RevisionForm from '../components/forms/RevisionForm';
import CraneRecordForm from '../components/forms/CraneRecordForm';
import LocationMap from '../components/maps/LocationMap';
import LocationManagementForm from '../components/forms/LocationManagementForm';
import ProjectAssignmentForm from '../components/forms/ProjectAssignmentForm';

const EquipmentDetail = () => {
  const { equipmentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [equipment, setEquipment] = useState(null);
  const [records, setRecords] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Modals
  const [showQuickControl, setShowQuickControl] = useState(false);
  const [quickControlType, setQuickControlType] = useState('daily');
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showRecordDetailModal, setShowRecordDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentData, recordsData, locationData, historyData] = await Promise.all([
          getEquipmentItem(equipmentId),
          getCraneRecords(equipmentId),
          getCurrentProject(equipmentId), // Nová logika projektů
          getEquipmentLocationHistory(equipmentId)
        ]);

        setEquipment(equipmentData);
        setRecords(recordsData);
        setCurrentLocation(locationData);
        setLocationHistory(historyData);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) {
      fetchData();
    }
  }, [equipmentId]);

  // Handle URL parameters for quick actions
  useEffect(() => {
    const action = searchParams.get('action');
    const type = searchParams.get('type');

    if (action === 'control' && type) {
      setQuickControlType(type);
      setShowQuickControl(true);
      setActiveTab('controls');
    } else if (action === 'incident') {
      setShowServiceRequestModal(true);
      setActiveTab('maintenance');
    } else if (action === 'revision') {
      setShowRevisionModal(true);
      setActiveTab('controls');
    }

    // Clear URL parameters after handling
    if (action) {
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const getUpcomingTasks = () => {
    const tasks = [];
    const now = new Date();
    
    // Kontroly
    const lastDaily = records.find(r => r.record_type === 'daily');
    if (!lastDaily || new Date(lastDaily.record_date) < new Date(now - 24 * 60 * 60 * 1000)) {
      tasks.push({
        type: 'control',
        subtype: 'daily',
        title: 'Denní kontrola',
        priority: 'high',
        overdue: !lastDaily || new Date(lastDaily.record_date) < new Date(now - 24 * 60 * 60 * 1000)
      });
    }

    const lastWeekly = records.find(r => r.record_type === 'weekly');
    if (!lastWeekly || new Date(lastWeekly.record_date) < new Date(now - 7 * 24 * 60 * 60 * 1000)) {
      tasks.push({
        type: 'control',
        subtype: 'weekly',
        title: 'Týdenní kontrola', 
        priority: 'medium',
        overdue: !lastWeekly || new Date(lastWeekly.record_date) < new Date(now - 7 * 24 * 60 * 60 * 1000)
      });
    }

    return tasks.sort((a, b) => {
      if (a.overdue && !b.overdue) return -1;
      if (!a.overdue && b.overdue) return 1;
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  };

  const getRecentActivity = () => {
    return records
      .sort((a, b) => new Date(b.record_date) - new Date(a.record_date))
      .slice(0, 5);
  };

  const handleQuickControl = (controlType) => {
    setQuickControlType(controlType);
    setShowQuickControl(true);
  };

  const handleRecordDetail = (record) => {
    setSelectedRecord(record);
    setShowRecordDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Načítám detail zařízení...</div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Zařízení nenalezeno</h3>
        <Link to="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          ← Zpět na přehled
        </Link>
      </div>
    );
  }

  const upcomingTasks = getUpcomingTasks();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-700">Přehled zařízení</Link>
        <span className="mx-2">›</span>
        {currentLocation?.location_name && (
          <>
            <span className="hover:text-gray-700">{currentLocation.location_name}</span>
            <span className="mx-2">›</span>
          </>
        )}
        <span className="text-gray-900">{equipment.manufacturer} {equipment.model}</span>
      </nav>

      {/* Equipment Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🏗️</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {equipment.manufacturer} {equipment.model}
              </h1>
              <p className="text-gray-600">
                {equipment.serial_number}
              </p>
              {currentLocation && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <span className="mr-1">📍</span>
                  <span className="font-medium">{currentLocation.location_name}</span>
                  {currentLocation.contact_person && (
                    <span className="ml-3 text-gray-500">
                      👤 {currentLocation.contact_person}
                    </span>
                  )}
                  {currentLocation.planned_removal_date && (
                    <span className="ml-3 text-orange-600">
                      ⏰ Demontáž: {new Date(currentLocation.planned_removal_date).toLocaleDateString('cs-CZ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleQuickControl('daily')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Rychlá kontrola
            </button>
            <button 
              onClick={() => setShowServiceRequestModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Hlásit problém
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Přehled', icon: '📊' },
            { id: 'controls', name: 'Kontroly & Revize', icon: '🔍' },
            { id: 'maintenance', name: 'Údržba', icon: '🔧' },
            { id: 'projects', name: 'Stavby & Historie', icon: '🏗️' },
            { id: 'documents', name: 'Dokumenty', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aktuální stav */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nadcházející úkoly */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nadcházející úkoly ({upcomingTasks.length})
              </h3>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        task.overdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`text-lg ${task.overdue ? '🚨' : '📅'}`}>
                          {task.overdue ? '🚨' : '📅'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{task.title}</div>
                          {task.overdue && (
                            <div className="text-sm text-red-600">Po termínu</div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleQuickControl(task.subtype)}
                        className={`px-3 py-1 rounded text-sm ${
                          task.overdue 
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Provést
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  ✅ Všechny úkoly jsou splněné
                </div>
              )}
            </div>

            {/* Poslední aktivity */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Poslední aktivity
              </h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-2">
                      <div className="text-lg">
                        {activity.record_category === 'control' ? '🔍' :
                         activity.record_category === 'revision' ? '📋' :
                         activity.record_category === 'maintenance' ? '🔧' :
                         activity.record_category === 'incident' ? '⚠️' : '📄'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.record_date).toLocaleDateString('cs-CZ')} • 
                          {activity.inspector_name}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        activity.result === 'passed' ? 'bg-green-100 text-green-800' :
                        activity.result === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {activity.result === 'passed' ? 'Prošlo' :
                         activity.result === 'failed' ? 'Neprošlo' : 'S poznámkami'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Žádné aktivity
                </div>
              )}
            </div>
          </div>

          {/* Boční panel */}
          <div className="space-y-6">
            {/* Technické údaje */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Technické údaje
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Výrobce:</span>
                  <span className="font-medium">{equipment.manufacturer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model:</span>
                  <span className="font-medium">{equipment.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sér. číslo:</span>
                  <span className="font-medium">{equipment.serial_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rok výroby:</span>
                  <span className="font-medium">{equipment.year_of_manufacture || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nosnost:</span>
                  <span className="font-medium">{equipment.max_load || 'N/A'} t</span>
                </div>
              </div>
            </div>

            {/* Aktuální lokace */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                📍 Aktuální lokace
              </h3>
              {currentLocation ? (
                <div className="space-y-3">
                  <div>
                    <div className="font-medium text-gray-900">{currentLocation.location_name}</div>
                    <div className="text-sm text-gray-500">
                      {currentLocation.address}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Montáž:</span>
                      <span className="font-medium">
                        {currentLocation.installed_date ? 
                          new Date(currentLocation.installed_date).toLocaleDateString('cs-CZ') : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plánovaná demontáž:</span>
                      <span className="font-medium">
                        {currentLocation.planned_removal_date ? 
                          new Date(currentLocation.planned_removal_date).toLocaleDateString('cs-CZ') : 'Neurčeno'}
                      </span>
                    </div>
                  </div>

                  {(currentLocation.contact_person || currentLocation.contact_phone) && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Kontakt na stavbu:</div>
                      {currentLocation.contact_person && (
                        <div className="text-sm text-gray-600">
                          👤 {currentLocation.contact_person}
                        </div>
                      )}
                      {currentLocation.contact_phone && (
                        <div className="text-sm text-gray-600">
                          📞 <a href={`tel:${currentLocation.contact_phone}`} className="hover:text-blue-600">
                            {currentLocation.contact_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {currentLocation.responsible_person_name && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Odpovědná osoba:</div>
                      <div className="text-sm text-gray-600">
                        🔧 {currentLocation.responsible_person_name}
                      </div>
                    </div>
                  )}

                  {currentLocation.notes && (
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Poznámky:</div>
                      <div className="text-sm text-gray-600">
                        {currentLocation.notes}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-3 flex space-x-2">
                    <button 
                      onClick={() => setShowMapModal(true)}
                      className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700"
                    >
                      🗺️ Zobrazit na mapě
                    </button>
                    <button 
                      onClick={() => setShowLocationModal(true)}
                      className="flex-1 bg-gray-200 text-gray-700 text-xs px-3 py-2 rounded hover:bg-gray-300"
                    >
                      🏗️ Správa projektů
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <div className="text-2xl mb-2">🏗️</div>
                  <div>Není přiřazen k projektu</div>
                  <button 
                    onClick={() => setShowLocationModal(true)}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
                  >
                    Přiřadit k projektu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Kontroly & Revize */}
      {activeTab === 'controls' && (
        <div className="space-y-6">
          {/* Rychlé akce */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rychlé akce</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => handleQuickControl('daily')}
                className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <span className="text-2xl mr-3">🔍</span>
                <div className="text-left">
                  <div className="font-medium text-blue-900">Denní kontrola</div>
                  <div className="text-sm text-blue-600">Rutinní kontrola před prací</div>
                </div>
              </button>
              <button
                onClick={() => handleQuickControl('weekly')}
                className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50"
              >
                <span className="text-2xl mr-3">🔎</span>
                <div className="text-left">
                  <div className="font-medium text-blue-900">Týdenní kontrola</div>
                  <div className="text-sm text-blue-600">Rozšířená kontrola</div>
                </div>
              </button>
              <button
                onClick={() => setShowRevisionModal(true)}
                className="flex items-center p-4 border border-green-200 rounded-lg hover:bg-green-50"
              >
                <span className="text-2xl mr-3">📋</span>
                <div className="text-left">
                  <div className="font-medium text-green-900">Revize</div>
                  <div className="text-sm text-green-600">Oficiální revizní protokol</div>
                </div>
              </button>
            </div>
          </div>

          {/* Historie kontrol a revizí */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Historie kontrol a revizí</h3>
              <div className="flex space-x-2">
                <select className="text-sm border border-gray-300 rounded px-2 py-1">
                  <option value="all">Všechny</option>
                  <option value="control">Kontroly</option>
                  <option value="revision">Revize</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              {records
                .filter(r => r.record_category === 'control' || r.record_category === 'revision')
                .slice(0, 10)
                .map((record) => (
                <div key={record.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="text-2xl">
                    {record.record_category === 'control' ? '🔍' : '📋'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{record.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.record_date).toLocaleDateString('cs-CZ')} • 
                      {record.inspector_name}
                    </div>
                    {record.findings && (
                      <div className="text-sm text-gray-600 mt-1">{record.findings}</div>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.result === 'passed' ? 'bg-green-100 text-green-800' :
                    record.result === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.result === 'passed' ? 'Prošlo' :
                     record.result === 'failed' ? 'Neprošlo' : 'S poznámkami'}
                  </div>
                  <button 
                    onClick={() => handleRecordDetail(record)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Údržba */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Servisní požadavky */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Servisní požadavky</h3>
              <button 
                onClick={() => setShowServiceRequestModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Hlásit problém
              </button>
            </div>
            
            <div className="space-y-3">
              {records
                .filter(r => r.record_category === 'maintenance' || r.record_category === 'incident')
                .slice(0, 5)
                .map((record) => (
                <div key={record.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="text-xl">
                    {record.record_category === 'maintenance' ? '🔧' : '⚠️'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{record.title}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(record.record_date).toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    record.status === 'completed' ? 'bg-green-100 text-green-800' :
                    record.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {record.status === 'completed' ? 'Dokončeno' :
                     record.status === 'in_progress' ? 'Probíhá' : 'Čeká'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plánovaná údržba */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Plánovaná údržba</h3>
            <div className="text-center py-8 text-gray-500">
              <div className="text-3xl mb-2">🛠️</div>
              <div>Žádná plánovaná údržba</div>
              <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                Naplánovat údržbu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stavby & Historie */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Aktuální projekt/stavba */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">🏗️ Aktuální stavba</h3>
              <div className="flex space-x-2">
                {currentLocation?.project_id && (
                  <Link 
                    to={`/projects/${currentLocation.project_id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Detail stavby
                  </Link>
                )}
                <button 
                  onClick={() => setShowMapModal(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Zobrazit na mapě
                </button>
              </div>
            </div>

            {currentLocation ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Info o projektu */}
                <div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 text-lg">
                        {currentLocation.project_name || currentLocation.location_name || 'Nepřiřazen'}
                      </h4>
                      <p className="text-gray-600">{currentLocation.address}</p>
                      {currentLocation.project_number && (
                        <p className="text-sm text-gray-500 mt-1">
                          Číslo projektu: {currentLocation.project_number}
                        </p>
                      )}
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded">
                        {currentLocation.project_name ? (
                          <span className="bg-green-100 text-green-800">🏗️ Aktivní na stavbě</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800">📦 Ve skladu</span>
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Montáž:</span>
                        <div className="font-medium">
                          {currentLocation.installed_date ? 
                            new Date(currentLocation.installed_date).toLocaleDateString('cs-CZ') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Plánovaná demontáž:</span>
                        <div className="font-medium">
                          {currentLocation.planned_removal_date ? 
                            new Date(currentLocation.planned_removal_date).toLocaleDateString('cs-CZ') : 'Neurčeno'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Motohodiny při montáži:</span>
                        <div className="font-medium">{currentLocation.operating_hours_start || 'N/A'} h</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Aktuální motohodiny:</span>
                        <div className="font-medium">{currentLocation.current_operating_hours || 'N/A'} h</div>
                      </div>
                    </div>

                    {currentLocation.project_name ? (
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-500 text-sm">Projektový manager:</span>
                          <div className="font-medium">{currentLocation.responsible_person_name || 'Neurčeno'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Kontakt na stavbu:</span>
                          <div className="font-medium">{currentLocation.contact_person || 'Neurčeno'}</div>
                          {currentLocation.contact_phone && (
                            <a href={`tel:${currentLocation.contact_phone}`} className="text-blue-600 text-sm block">
                              {currentLocation.contact_phone}
                            </a>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Operátor:</span>
                          <div className="font-medium">{currentLocation.operator_name || 'Nepřiřazen'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        Jeřáb není přiřazen k žádné aktivní stavbě
                      </div>
                    )}
                  </div>
                </div>

                {/* Mini mapa preview */}
                <div>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">🗺️</div>
                      <div className="text-sm">
                        {currentLocation.gps_latitude && currentLocation.gps_longitude ? (
                          <div>
                            <div>GPS: {currentLocation.gps_latitude}, {currentLocation.gps_longitude}</div>
                            <button 
                              onClick={() => setShowMapModal(true)}
                              className="mt-2 text-blue-600 hover:text-blue-800"
                            >
                              Klikněte pro zobrazení mapy
                            </button>
                          </div>
                        ) : (
                          <div>GPS souřadnice nejsou k dispozici</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🏗️</div>
                <div className="text-lg mb-2">Žádný aktivní projekt</div>
                <div className="text-sm mb-4">Zařízení není aktuálně přiřazeno k žádné stavbě</div>
                <button 
                  onClick={() => setShowLocationModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Přiřadit k projektu
                </button>
              </div>
            )}
          </div>

          {/* Historie lokací */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📅 Historie lokací</h3>
            
            {locationHistory.length > 0 ? (
              <div className="space-y-4">
                {locationHistory.map((location, index) => (
                  <div key={location.id} className={`border rounded-lg p-4 ${
                    location.actual_removal_date ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900">{location.location_name}</h4>
                          {!location.actual_removal_date && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Aktuální
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📍 {location.address}</div>
                          <div>📅 Montáž: {new Date(location.installed_date).toLocaleDateString('cs-CZ')}</div>
                          {location.actual_removal_date && (
                            <div>🏁 Demontáž: {new Date(location.actual_removal_date).toLocaleDateString('cs-CZ')}</div>
                          )}
                          {location.planned_removal_date && !location.actual_removal_date && (
                            <div>⏰ Plánovaná demontáž: {new Date(location.planned_removal_date).toLocaleDateString('cs-CZ')}</div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                              <span className="text-gray-500">Kontakt:</span> {location.contact_person || 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-500">Odpovědný:</span> {location.responsible_person_name || 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-500">Mth. start:</span> {location.operating_hours_start || 'N/A'} h
                            </div>
                            <div>
                              <span className="text-gray-500">Mth. konec:</span> {location.operating_hours_end || location.current_operating_hours || 'N/A'} h
                            </div>
                          </div>

                          {location.notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                              <strong>Poznámky:</strong> {location.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {location.gps_latitude && location.gps_longitude && (
                          <button 
                            onClick={() => setShowMapModal(true)} // TODO: Pass specific location
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Zobrazit na mapě"
                          >
                            🗺️
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-800 text-sm" title="Detail">
                          ℹ️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-3xl mb-2">📋</div>
                <div>Žádná historie lokací</div>
                <div className="text-sm mt-1">Historie se vytváří automaticky při přiřazování lokací</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Dokumenty */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dokumenty zařízení</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technické dokumenty */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📋 Technické dokumenty</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Technický list</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Stáhnout</button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Návod k obsluze</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Stáhnout</button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Schéma zapojení</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Stáhnout</button>
                  </div>
                </div>
              </div>

              {/* Certifikáty a revize */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🏆 Certifikáty</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">ES Prohlášení o shodě</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Zobrazit</button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Revizní zpráva 2024</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Zobrazit</button>
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Zatěžkávací zkouška</span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Zobrazit</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                📎 Nahrát dokument
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Control Modal */}
      <Modal
        isOpen={showQuickControl}
        onClose={() => setShowQuickControl(false)}
        title={`Rychlá ${quickControlType === 'daily' ? 'denní' : 'týdenní'} kontrola`}
        size="lg"
      >
        <ControlChecklistForm
          controlType={quickControlType}
          selectedEquipment={equipment}
          onSubmit={async () => {
            setShowQuickControl(false);
            // Refresh data
            const recordsData = await getCraneRecords(equipmentId);
            setRecords(recordsData);
          }}
          onCancel={() => setShowQuickControl(false)}
        />
      </Modal>

      {/* Revision Modal */}
      <Modal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        title="Revizní protokol"
        size="xl"
      >
        <RevisionForm
          initialValues={{
            equipment_id: equipment?.id,
            revision_date: new Date().toISOString().split('T')[0],
            location: currentLocation?.location_name || ''
          }}
          selectedEquipment={equipment}
          onSubmit={async () => {
            setShowRevisionModal(false);
            // Refresh data
            const recordsData = await getCraneRecords(equipmentId);
            setRecords(recordsData);
          }}
          onCancel={() => setShowRevisionModal(false)}
        />
      </Modal>

      {/* Service Request Modal */}
      <Modal
        isOpen={showServiceRequestModal}
        onClose={() => setShowServiceRequestModal(false)}
        title="Hlášení problému"
        size="lg"
      >
        <CraneRecordForm
          initialValues={{
            equipment_id: equipment?.id,
            record_category: 'incident',
            record_type: 'malfunction',
            record_date: new Date().toISOString().split('T')[0]
          }}
          selectedEquipment={equipment}
          onSubmit={async () => {
            setShowServiceRequestModal(false);
            // Refresh data
            const recordsData = await getCraneRecords(equipmentId);
            setRecords(recordsData);
          }}
          onCancel={() => setShowServiceRequestModal(false)}
        />
      </Modal>

      {/* Location Management Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title="Přiřazení k projektu"
        size="xl"
      >
        <ProjectAssignmentForm
          equipmentId={equipmentId}
          currentProject={currentLocation}
          onSubmit={async (assignmentData) => {
            console.log('Assignment data:', assignmentData);
            setShowLocationModal(false);
            
            // Refresh data
            const [locationData2, historyData] = await Promise.all([
              getCurrentProject(equipmentId), // Nová logika projektů
              getEquipmentLocationHistory(equipmentId)
            ]);
            setCurrentLocation(locationData2);
            setLocationHistory(historyData);
          }}
          onCancel={() => setShowLocationModal(false)}
        />
      </Modal>

      {/* Map Modal */}
      <Modal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        title={`Mapa - ${currentLocation?.location_name || 'Lokace'}`}
        size="xl"
      >
        <LocationMap 
          location={currentLocation} 
          height="500px"
        />
      </Modal>

      {/* Record Detail Modal */}
      <Modal
        isOpen={showRecordDetailModal}
        onClose={() => setShowRecordDetailModal(false)}
        title="Detail záznamu"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Record Header */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {selectedRecord.record_category === 'control' ? '🔍' :
                   selectedRecord.record_category === 'revision' ? '📋' :
                   selectedRecord.record_category === 'maintenance' ? '🔧' :
                   selectedRecord.record_category === 'incident' ? '⚠️' : '📄'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedRecord.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedRecord.record_date).toLocaleDateString('cs-CZ')} • 
                    {selectedRecord.inspector_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Kategorie</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRecord.record_category === 'control' ? 'Kontrola' :
                   selectedRecord.record_category === 'revision' ? 'Revize' :
                   selectedRecord.record_category === 'maintenance' ? 'Údržba' :
                   selectedRecord.record_category === 'incident' ? 'Incident' : selectedRecord.record_category}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Typ</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRecord.record_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Výsledek</label>
                <div className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  selectedRecord.result === 'passed' ? 'bg-green-100 text-green-800' :
                  selectedRecord.result === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedRecord.result === 'passed' ? 'Prošlo' :
                   selectedRecord.result === 'failed' ? 'Neprošlo' : 'S poznámkami'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Stav</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedRecord.status === 'completed' ? 'Dokončeno' :
                   selectedRecord.status === 'in_progress' ? 'Probíhá' : 'Čeká'}
                </p>
              </div>
            </div>

            {/* Findings */}
            {selectedRecord.findings && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Zjištění</label>
                <div className="mt-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedRecord.findings}</p>
                </div>
              </div>
            )}

            {/* Actions Taken */}
            {selectedRecord.actions_taken && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Provedené akce</label>
                <div className="mt-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedRecord.actions_taken}</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedRecord.recommendations && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Doporučení</label>
                <div className="mt-1 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-900">{selectedRecord.recommendations}</p>
                </div>
              </div>
            )}

            {/* Checklist Results */}
            {selectedRecord.checklist_results && Object.keys(selectedRecord.checklist_results).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Detail kontrolních úkonů</label>
                <div className="space-y-4">
                  {Object.entries(selectedRecord.checklist_results).map(([sectionKey, section]) => (
                    <div key={sectionKey} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3 capitalize">
                        {sectionKey.replace(/_/g, ' ')}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(section).map(([itemKey, item]) => (
                          <div key={itemKey} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex-1">
                              <span className="text-sm text-gray-900 capitalize">
                                {itemKey.replace(/_/g, ' ')}
                              </span>
                              {item.notes && (
                                <p className="text-xs text-gray-600 mt-1">{item.notes}</p>
                              )}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.result === 'ok' ? 'bg-green-100 text-green-800' :
                              item.result === 'defect' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.result === 'ok' ? '✅ OK' :
                               item.result === 'defect' ? '❌ Závada' : '❓ Nekontrolováno'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Data */}
            {(selectedRecord.operating_hours || selectedRecord.weather_conditions) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedRecord.operating_hours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Motohodiny</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.operating_hours} h</p>
                  </div>
                )}
                {selectedRecord.weather_conditions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Počasí</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRecord.weather_conditions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => setShowRecordDetailModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Zavřít
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EquipmentDetail;