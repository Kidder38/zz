import React, { useState, useEffect } from 'react';
import { getCraneRecords } from '../../services/craneRecordsService';
import { getEquipmentLocationHistory } from '../../services/equipmentLocationService';

const EquipmentTimeline = ({ equipmentId, equipment }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all', 'records', 'locations', 'alerts'
  const [timeRange, setTimeRange] = useState('year'); // 'month', 'quarter', 'year', 'all'

  useEffect(() => {
    fetchTimelineData();
  }, [equipmentId]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const [records, locationHistory] = await Promise.all([
        getCraneRecords(equipmentId),
        getEquipmentLocationHistory(equipmentId)
      ]);

      // Kombinace záznamů a historie umístění do jedné timeline
      const combined = [];

      // Přidáme záznamy
      records.forEach(record => {
        combined.push({
          id: `record_${record.id}`,
          type: 'record',
          category: record.record_category,
          date: record.record_date,
          time: record.record_time,
          title: record.title,
          description: record.description,
          status: record.status,
          result: record.result,
          severity: record.severity,
          inspector_name: record.inspector_name,
          location_name: record.location_name,
          findings: record.findings,
          recommendations: record.recommendations,
          data: record
        });
      });

      // Přidáme události umístění
      locationHistory.forEach(location => {
        // Příchod na lokaci
        combined.push({
          id: `location_arrival_${location.id}`,
          type: 'location',
          category: 'arrival',
          date: location.installed_date,
          time: '09:00:00',
          title: `Příchod na ${location.location_name}`,
          description: `Jeřáb byl přesunut na lokaci ${location.location_name}`,
          status: 'completed',
          location_name: location.location_name,
          location_type: location.location_type,
          status_on_arrival: location.status_on_arrival,
          responsible_person: location.responsible_person_name,
          data: location
        });

        // Montáž (pokud existuje)
        if (location.montage_completion_date) {
          combined.push({
            id: `location_montage_${location.id}`,
            type: 'location',
            category: 'montage',
            date: location.montage_completion_date,
            time: '16:00:00',
            title: `Dokončení montáže na ${location.location_name}`,
            description: 'Montáž jeřábu byla úspěšně dokončena',
            status: 'completed',
            location_name: location.location_name,
            data: location
          });
        }

        // Revize po montáži
        if (location.revision_after_montage_date) {
          combined.push({
            id: `location_revision_${location.id}`,
            type: 'location',
            category: 'revision_after_montage',
            date: location.revision_after_montage_date,
            time: '10:00:00',
            title: `Revize po montáži na ${location.location_name}`,
            description: 'Povinná revize dle NV 193/2022',
            status: 'completed',
            location_name: location.location_name,
            data: location
          });
        }

        // Odchod z lokace (pokud existuje)
        if (location.actual_removal_date) {
          combined.push({
            id: `location_departure_${location.id}`,
            type: 'location',
            category: 'departure',
            date: location.actual_removal_date,
            time: '15:00:00',
            title: `Odchod z ${location.location_name}`,
            description: `Jeřáb byl demontován a odvezen z lokace`,
            status: 'completed',
            location_name: location.location_name,
            status_on_departure: location.status_on_departure,
            data: location
          });
        }
      });

      // Seřadíme podle data (nejnovější první)
      combined.sort((a, b) => {
        const dateA = new Date(a.date + ' ' + (a.time || '00:00:00'));
        const dateB = new Date(b.date + ' ' + (b.time || '00:00:00'));
        return dateB - dateA;
      });

      setTimelineData(combined);
    } catch (error) {
      console.error('Chyba při načítání timeline dat:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrování podle typu
  const filteredData = timelineData.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'records' && item.type === 'record') return true;
    if (filterType === 'locations' && item.type === 'location') return true;
    if (filterType === 'alerts' && (item.severity === 'high' || item.severity === 'critical')) return true;
    return false;
  });

  // Filtrování podle časového rozsahu
  const now = new Date();
  const timeFilteredData = filteredData.filter(item => {
    const itemDate = new Date(item.date);
    switch (timeRange) {
      case 'month':
        return (now - itemDate) <= (30 * 24 * 60 * 60 * 1000);
      case 'quarter':
        return (now - itemDate) <= (90 * 24 * 60 * 60 * 1000);
      case 'year':
        return (now - itemDate) <= (365 * 24 * 60 * 60 * 1000);
      default:
        return true;
    }
  });

  // Helper funkce
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString + (timeString ? ' ' + timeString : ''));
    return date.toLocaleString('cs-CZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemIcon = (item) => {
    if (item.type === 'location') {
      switch (item.category) {
        case 'arrival': return '📍';
        case 'montage': return '🏗️';
        case 'revision_after_montage': return '🔍';
        case 'departure': return '🚛';
        default: return '📍';
      }
    } else {
      switch (item.category) {
        case 'control': return '✅';
        case 'revision': return '🔍';
        case 'maintenance': return '🔧';
        case 'incident': return '⚠️';
        default: return '📄';
      }
    }
  };

  const getItemColor = (item) => {
    if (item.type === 'location') {
      switch (item.category) {
        case 'arrival': return 'bg-blue-500';
        case 'montage': return 'bg-green-500';
        case 'revision_after_montage': return 'bg-indigo-500';
        case 'departure': return 'bg-gray-500';
        default: return 'bg-blue-500';
      }
    } else {
      switch (item.severity) {
        case 'critical': return 'bg-red-500';
        case 'high': return 'bg-orange-500';
        case 'medium': return 'bg-yellow-500';
        case 'low': return 'bg-green-500';
        default: return 'bg-gray-400';
      }
    }
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

  const getResultIcon = (result) => {
    switch (result) {
      case 'passed': return '✅';
      case 'passed_with_remarks': return '⚠️';
      case 'failed': return '❌';
      default: return '';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Načítání timeline...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header a filtry */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Historie jeřábu - {equipment?.manufacturer} {equipment?.model}
          </h2>
          <div className="text-sm text-gray-500">
            {equipment?.serial_number && `SN: ${equipment.serial_number}`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ události
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">Všechny události ({timelineData.length})</option>
              <option value="records">Záznamy kontrol ({timelineData.filter(i => i.type === 'record').length})</option>
              <option value="locations">Změny umístění ({timelineData.filter(i => i.type === 'location').length})</option>
              <option value="alerts">Upozornění ({timelineData.filter(i => i.severity === 'high' || i.severity === 'critical').length})</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Časové období
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="month">Poslední měsíc</option>
              <option value="quarter">Poslední 3 měsíce</option>
              <option value="year">Poslední rok</option>
              <option value="all">Celá historie</option>
            </select>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {timeFilteredData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Žádné události pro vybraná kritéria
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {timeFilteredData.map((item, itemIdx) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== timeFilteredData.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getItemColor(item)}`}>
                          <span className="text-white text-sm">
                            {getItemIcon(item)}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {item.title}
                            </p>
                            <time className="text-sm text-gray-500">
                              {formatDateTime(item.date, item.time)}
                            </time>
                          </div>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            
                            {item.result && (
                              <span className="text-sm">
                                {getResultIcon(item.result)} {item.result.replace('_', ' ')}
                              </span>
                            )}
                            
                            {item.severity && item.severity !== 'info' && (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                item.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                item.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.severity.toUpperCase()}
                              </span>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="mt-2 text-sm text-gray-700">
                              {item.description}
                            </p>
                          )}
                          
                          {item.findings && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Zjištění:</span> {item.findings}
                              </p>
                            </div>
                          )}
                          
                          {item.recommendations && (
                            <div className="mt-1">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Doporučení:</span> {item.recommendations}
                              </p>
                            </div>
                          )}
                          
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            {item.location_name && (
                              <span>📍 {item.location_name}</span>
                            )}
                            {item.inspector_name && (
                              <span>👤 {item.inspector_name}</span>
                            )}
                            {item.responsible_person && (
                              <span>👤 {item.responsible_person}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Statistiky */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Celkem událostí
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {timelineData.length}
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
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Kontroly
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {timelineData.filter(i => i.category === 'control').length}
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
                <span className="text-2xl">🏗️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Přesuny
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {timelineData.filter(i => i.category === 'arrival').length}
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
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Problémy
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {timelineData.filter(i => i.severity === 'high' || i.severity === 'critical' || i.category === 'incident').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentTimeline;