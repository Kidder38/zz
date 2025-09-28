import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEquipmentForUser } from '../services/equipmentService';
import { getCraneRecords } from '../services/craneRecordsService';
import { getCurrentLocation, getCurrentProject } from '../services/equipmentLocationService';
import { useAuth } from '../auth/AuthContext';

const EquipmentDashboard = () => {
  const [equipment, setEquipment] = useState([]);
  const [equipmentStatus, setEquipmentStatus] = useState({});
  const [equipmentLocations, setEquipmentLocations] = useState({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const equipmentData = await getEquipmentForUser(currentUser);
        setEquipment(equipmentData);

        // Načti stav a projekty pro každé zařízení
        const dataPromises = equipmentData.map(async (eq) => {
          const [records, location] = await Promise.all([
            getCraneRecords(eq.id),
            getCurrentProject(eq.id) // Používá novou logiku projektů
          ]);
          
          const recentControls = records.filter(r => 
            r.record_category === 'control' && 
            new Date(r.record_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          );
          const issues = records.filter(r => r.result === 'failed' || r.severity === 'high');
          
          return {
            equipmentId: eq.id,
            lastControl: recentControls[0]?.record_date || null,
            hasIssues: issues.length > 0,
            upcomingTasks: getUpcomingTasks(records),
            status: getEquipmentStatus(recentControls, issues),
            location: location
          };
        });

        const statusData = await Promise.all(dataPromises);
        console.log('Dashboard status data:', statusData);
        const statusMap = statusData.reduce((acc, status) => {
          acc[status.equipmentId] = status;
          return acc;
        }, {});
        console.log('Dashboard status map:', statusMap);
        
        setEquipmentStatus(statusMap);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const getEquipmentStatus = (recentControls, issues) => {
    if (issues.length > 0) return 'critical';
    if (recentControls.length === 0) return 'warning';
    return 'good';
  };

  const getUpcomingTasks = (records) => {
    const tasks = [];
    const lastDaily = records.find(r => r.record_type === 'daily');
    const lastWeekly = records.find(r => r.record_type === 'weekly');
    
    if (!lastDaily || new Date(lastDaily.record_date) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      tasks.push({ type: 'daily', label: 'Denní kontrola', priority: 'high' });
    }
    
    if (!lastWeekly || new Date(lastWeekly.record_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      tasks.push({ type: 'weekly', label: 'Týdenní kontrola', priority: 'medium' });
    }
    
    return tasks;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'bg-green-100 border-green-300 text-green-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getLocationSummary = () => {
    const locationGroups = {};
    
    Object.values(equipmentStatus).forEach(status => {
      if (status.location) {
        const locationName = status.location.location_name || 'Neznámá lokace';
        if (!locationGroups[locationName]) {
          locationGroups[locationName] = {
            location_name: locationName,
            contact_person: status.location.contact_person,
            equipment_count: 0,
            statuses: []
          };
        }
        locationGroups[locationName].equipment_count++;
        locationGroups[locationName].statuses.push(status.status);
      }
    });
    
    return Object.values(locationGroups).sort((a, b) => b.equipment_count - a.equipment_count);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Načítám zařízení...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Můj park zařízení</h1>
            <p className="text-gray-600 mt-1">
              Přehled všech zařízení pod vaší správou
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Celkem zařízení</div>
            <div className="text-3xl font-bold text-gray-900">{equipment.length}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">⚡ Rychlé akce</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/crane-records"
            className="flex items-center p-4 border border-blue-200 rounded-lg hover:bg-blue-50 group"
          >
            <span className="text-2xl mr-3">📋</span>
            <div>
              <div className="font-medium text-blue-900 group-hover:text-blue-800">
                Všechny záznamy
              </div>
              <div className="text-sm text-blue-600">
                Přehled všech kontrol a revizí
              </div>
            </div>
          </Link>
          
          <Link
            to="/projects"
            className="flex items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 group"
          >
            <span className="text-2xl mr-3">🏗️</span>
            <div>
              <div className="font-medium text-green-900 group-hover:text-green-800">
                Správa staveb
              </div>
              <div className="text-sm text-green-600">
                Projekty a přiřazování jeřábů
              </div>
            </div>
          </Link>
          
          <Link
            to="/equipment"
            className="flex items-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 group"
          >
            <span className="text-2xl mr-3">🏗️</span>
            <div>
              <div className="font-medium text-purple-900 group-hover:text-purple-800">
                Správa zařízení
              </div>
              <div className="text-sm text-purple-600">
                Editace a konfigurace
              </div>
            </div>
          </Link>
          
          <Link
            to="/users"
            className="flex items-center p-4 border border-orange-200 rounded-lg hover:bg-orange-50 group"
          >
            <span className="text-2xl mr-3">👥</span>
            <div>
              <div className="font-medium text-orange-900 group-hover:text-orange-800">
                Uživatelé
              </div>
              <div className="text-sm text-orange-600">
                Správa uživatelů a obsluhy
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Project Summary */}
      {Object.keys(equipmentStatus).length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🏗️ Přehled staveb</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getLocationSummary().map((locationGroup, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">
                    {locationGroup.location_name}
                  </h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {locationGroup.equipment_count} zařízení
                  </span>
                </div>
                {locationGroup.contact_person && (
                  <p className="text-sm text-gray-600">
                    Kontakt: {locationGroup.contact_person}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {locationGroup.statuses.map((status, i) => (
                    <span key={i} className={`w-2 h-2 rounded-full ${
                      status === 'good' ? 'bg-green-400' :
                      status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((eq) => {
          const status = equipmentStatus[eq.id] || {};
          const statusClass = getStatusColor(status.status);
          
          return (
            <Link
              key={eq.id}
              to={`/equipment/${eq.id}`}
              className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Status Header */}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-3 ${statusClass}`}>
                  <span className="mr-1">{getStatusIcon(status.status)}</span>
                  {status.status === 'good' ? 'V pořádku' : 
                   status.status === 'warning' ? 'Pozornost' : 
                   status.status === 'critical' ? 'Kritický' : 'Neznámý'}
                </div>

                {/* Equipment Info */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {eq.manufacturer} {eq.model}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {eq.serial_number}
                </p>
                
                {/* Project Info */}
                <div className="mb-3 p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center text-sm">
                    <span className="mr-1">🏗️</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {status.location?.project_name || status.location?.location_name || 'Nepřiřazen'}
                      </div>
                      {status.location?.contact_person && (
                        <div className="text-gray-600 text-xs">
                          Kontakt: {status.location.contact_person}
                        </div>
                      )}
                      {status.location?.project_number && (
                        <div className="text-gray-500 text-xs">
                          {status.location.project_number}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <div className="text-gray-500">Poslední kontrola</div>
                    <div className="font-medium">
                      {status.lastControl 
                        ? new Date(status.lastControl).toLocaleDateString('cs-CZ')
                        : 'Neprovedena'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Úkoly</div>
                    <div className="font-medium">
                      {status.upcomingTasks?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/equipment/${eq.id}?action=control&type=daily`;
                    }}
                    className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded hover:bg-blue-700 text-center"
                  >
                    Denní kontrola
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = `/equipment/${eq.id}?action=incident`;
                    }}
                    className="flex-1 bg-red-600 text-white text-xs px-3 py-2 rounded hover:bg-red-700 text-center"
                  >
                    Hlásit problém
                  </button>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {equipment.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Žádná zařízení
          </h3>
          <p className="text-gray-500">
            Nemáte přiřazena žádná zařízení. Kontaktujte správce.
          </p>
        </div>
      )}
    </div>
  );
};

export default EquipmentDashboard;