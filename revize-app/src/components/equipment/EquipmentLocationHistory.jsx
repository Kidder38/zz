import React, { useState, useEffect } from 'react';
import { getEquipmentLocationHistory, moveEquipment } from '../../services/equipmentLocationService';
import { getLocations } from '../../services/locationService';

const EquipmentLocationHistory = ({ equipmentId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMoveForm, setShowMoveForm] = useState(false);
  
  // Form data pro přesun
  const [moveFormData, setMoveFormData] = useState({
    new_location_id: '',
    planned_removal_date: '',
    planned_installation_date: '',
    responsible_person_id: null,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [equipmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyData, locationsData] = await Promise.all([
        getEquipmentLocationHistory(equipmentId),
        getLocations()
      ]);
      setHistory(historyData);
      setLocations(locationsData.filter(loc => loc.is_active));
    } catch (error) {
      console.error('Chyba při načítání historie umístění:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveFormChange = (e) => {
    const { name, value } = e.target;
    setMoveFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoveSubmit = async (e) => {
    e.preventDefault();
    try {
      await moveEquipment(equipmentId, moveFormData);
      setShowMoveForm(false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Chyba při plánování přesunu:', error);
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('cs-CZ') : '-';
  };

  const getStatusColor = (status) => {
    const colors = {
      operational: 'bg-green-100 text-green-800',
      stored: 'bg-gray-100 text-gray-800',
      in_transport: 'bg-blue-100 text-blue-800',
      mounting: 'bg-yellow-100 text-yellow-800',
      dismounting: 'bg-orange-100 text-orange-800',
      maintenance: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getLocationIcon = (type) => {
    const icons = {
      construction_site: '🏗️',
      warehouse: '📦', 
      workshop: '🔧',
      transport: '🚛'
    };
    return icons[type] || '📍';
  };

  if (loading) {
    return <div className="text-center py-8">Načítání historie...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header s možností přesunu */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Historie umístění
        </h3>
        <button
          onClick={() => setShowMoveForm(!showMoveForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Naplánovat přesun
        </button>
      </div>

      {/* Formulář pro přesun */}
      {showMoveForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="text-md font-medium text-gray-900 mb-3">Naplánovat přesun jeřábu</h4>
          <form onSubmit={handleMoveSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nová lokace *
                </label>
                <select
                  name="new_location_id"
                  value={moveFormData.new_location_id}
                  onChange={handleMoveFormChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="">Vyberte lokaci...</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {getLocationIcon(location.location_type)} {location.location_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plánovaná instalace
                </label>
                <input
                  type="date"
                  name="planned_installation_date"
                  value={moveFormData.planned_installation_date}
                  onChange={handleMoveFormChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poznámky
              </label>
              <textarea
                name="notes"
                value={moveFormData.notes}
                onChange={handleMoveFormChange}
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Důvod přesunu, speciální požadavky..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowMoveForm(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Naplánovat přesun
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline historie */}
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Žádná historie umístění
        </div>
      ) : (
        <div className="flow-root">
          <ul className="-mb-8">
            {history.map((item, itemIdx) => {
              const isCurrentLocation = !item.actual_removal_date;
              const daysAtLocation = item.actual_removal_date 
                ? Math.ceil((new Date(item.actual_removal_date) - new Date(item.installed_date)) / (1000 * 60 * 60 * 24))
                : Math.ceil((new Date() - new Date(item.installed_date)) / (1000 * 60 * 60 * 24));
              
              return (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {itemIdx !== history.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          isCurrentLocation ? 'bg-green-500' : 'bg-gray-400'
                        }`}>
                          <span className="text-white text-sm">
                            {getLocationIcon(item.location_type)}
                          </span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.location_name}
                            {isCurrentLocation && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Aktuální
                              </span>
                            )}
                          </p>
                          <div className="mt-1 text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-4">
                              <span>📅 {formatDate(item.installed_date)}</span>
                              {item.actual_removal_date && (
                                <span>→ {formatDate(item.actual_removal_date)}</span>
                              )}
                              <span className="text-xs text-gray-500">
                                ({daysAtLocation} {daysAtLocation === 1 ? 'den' : daysAtLocation < 5 ? 'dny' : 'dnů'})
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status_on_arrival)}`}>
                                Příchod: {item.status_on_arrival}
                              </span>
                              {item.status_on_departure && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status_on_departure)}`}>
                                  Odchod: {item.status_on_departure}
                                </span>
                              )}
                            </div>
                            
                            {item.responsible_person_name && (
                              <div>
                                <span className="text-gray-500">👤 Odpovědný:</span> {item.responsible_person_name}
                              </div>
                            )}
                            
                            {item.contact_person && (
                              <div>
                                <span className="text-gray-500">📞 Kontakt:</span> {item.contact_person}
                                {item.contact_phone && <span> ({item.contact_phone})</span>}
                              </div>
                            )}
                            
                            {(item.operating_hours_start !== null || item.operating_hours_end !== null) && (
                              <div>
                                <span className="text-gray-500">⏱️ Motohodiny:</span>{' '}
                                {item.operating_hours_start || 0}h
                                {item.operating_hours_end && ` → ${item.operating_hours_end}h`}
                                {item.current_operating_hours && !item.operating_hours_end && 
                                  ` → ${item.current_operating_hours}h (aktuálně)`
                                }
                              </div>
                            )}
                            
                            {item.montage_completion_date && (
                              <div>
                                <span className="text-gray-500">🏗️ Montáž dokončena:</span> {formatDate(item.montage_completion_date)}
                              </div>
                            )}
                            
                            {item.revision_after_montage_date && (
                              <div>
                                <span className="text-gray-500">🔍 Revize po montáži:</span> {formatDate(item.revision_after_montage_date)}
                              </div>
                            )}
                            
                            {item.revision_before_demontage_date && (
                              <div>
                                <span className="text-gray-500">🔍 Revize před demontáží:</span> {formatDate(item.revision_before_demontage_date)}
                              </div>
                            )}
                            
                            {item.notes && (
                              <div>
                                <span className="text-gray-500">📝 Poznámky:</span> {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <div>{formatDate(item.created_at)}</div>
                          {item.address && (
                            <div className="text-xs mt-1">{item.address}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Tlačítko zavření */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Zavřít
        </button>
      </div>
    </div>
  );
};

export default EquipmentLocationHistory;