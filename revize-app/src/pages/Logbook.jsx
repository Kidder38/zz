import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEquipmentForUser } from '../services/equipmentService';
import { getLogbookEntries } from '../services/logbookService';
import { useAuth } from '../auth/AuthContext';

const Logbook = () => {
  const [equipment, setEquipment] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [logbookEntries, setLogbookEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { currentUser } = useAuth();

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

  useEffect(() => {
    if (!selectedEquipment) return;

    const fetchLogbookEntries = async () => {
      setEntriesLoading(true);
      try {
        const params = activeTab !== 'all' ? { entry_type: activeTab } : {};
        const data = await getLogbookEntries(selectedEquipment.id, params);
        setLogbookEntries(data);
      } catch (error) {
        console.error('Chyba při načítání záznamů deníku:', error);
      } finally {
        setEntriesLoading(false);
      }
    };

    fetchLogbookEntries();
  }, [selectedEquipment, activeTab]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatTime = (timeString) => {
    return timeString ? timeString.slice(0, 5) : '';
  };

  const getEntryTypeLabel = (type) => {
    const labels = {
      daily_check: 'Denní kontrola',
      fault_report: 'Hlášení poruchy',
      operation: 'Provozní záznam',
      maintenance: 'Údržba',
      incident: 'Mimořádná událost'
    };
    return labels[type] || type;
  };

  const getEntryTypeColor = (type) => {
    const colors = {
      daily_check: 'bg-green-100 text-green-800',
      fault_report: 'bg-red-100 text-red-800',
      operation: 'bg-blue-100 text-blue-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      incident: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };
    return colors[severity] || 'text-gray-600';
  };

  if (loading) {
    return <div className="text-center py-8">Načítání...</div>;
  }

  if (equipment.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Žádná zařízení</h2>
        <p className="text-gray-600 mb-4">Pro vedení deníku musíte mít evidovaná zařízení.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Provozní deník</h1>
        <p className="mt-2 text-sm text-gray-700">
          Vedení provozního deníku podle ČSN EN 12480-1
        </p>
      </div>

      {/* Equipment Selector */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Vyberte zařízení</h2>
          <Link
            to="/users"
            className="text-sm text-indigo-600 hover:text-indigo-900"
          >
            Správa uživatelů & obsluhy
          </Link>
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
              <h3 className="font-medium text-gray-900">
                {item.manufacturer} {item.model}
              </h3>
              <p className="text-sm text-gray-600">{item.equipment_type}</p>
              <p className="text-sm text-gray-500">{item.company_name}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedEquipment && (
        <>
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Rychlé akce</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to={`/logbook/daily-check/${selectedEquipment.id}`}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Denní kontrola
              </Link>
              
              <Link
                to={`/logbook/fault-report/${selectedEquipment.id}`}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Nahlásit poruchu
              </Link>

              <Link
                to={`/logbook/operation/${selectedEquipment.id}`}
                className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Provozní záznam
              </Link>
            </div>
          </div>

          {/* Logbook Entries */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Historie záznamů - {selectedEquipment.manufacturer} {selectedEquipment.model}
              </h2>
              
              {/* Filter Tabs */}
              <div className="mt-4">
                <nav className="flex space-x-8">
                  {[
                    { key: 'all', label: 'Vše', count: logbookEntries.length },
                    { key: 'daily_check', label: 'Kontroly', count: logbookEntries.filter(e => e.entry_type === 'daily_check').length },
                    { key: 'fault_report', label: 'Poruchy', count: logbookEntries.filter(e => e.entry_type === 'fault_report').length },
                    { key: 'operation', label: 'Provoz', count: logbookEntries.filter(e => e.entry_type === 'operation').length }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.key
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                      <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {entriesLoading ? (
                <div className="p-6 text-center">Načítání záznamů...</div>
              ) : logbookEntries.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Žádné záznamy pro vybrané kritéria
                </div>
              ) : (
                logbookEntries.map((entry) => (
                  <div key={entry.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEntryTypeColor(entry.entry_type)}`}>
                            {getEntryTypeLabel(entry.entry_type)}
                          </span>
                          {entry.severity && (
                            <span className={`text-sm font-medium ${getSeverityColor(entry.severity)}`}>
                              {entry.severity.toUpperCase()}
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(entry.entry_date)} {formatTime(entry.entry_time)}
                          </span>
                        </div>
                        
                        <h3 className="text-sm font-medium text-gray-900">
                          {entry.fault_title || entry.notes || getEntryTypeLabel(entry.entry_type)}
                        </h3>
                        
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                          <span>Obsluha: {entry.first_name} {entry.last_name}</span>
                          {entry.shift && <span>Směna: {entry.shift}</span>}
                          {entry.operating_hours && <span>Motohodiny: {entry.operating_hours}h</span>}
                        </div>

                        {entry.daily_checks && entry.daily_checks.length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Kontrolní seznam: </span>
                            <span className="text-green-600">
                              {entry.daily_checks.filter(check => check.result === 'ok').length} vyhovuje
                            </span>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-red-600">
                              {entry.daily_checks.filter(check => check.result === 'defect').length} závad
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={`/logbook/entry/${entry.id}`}
                        className="ml-4 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Detail →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Logbook;