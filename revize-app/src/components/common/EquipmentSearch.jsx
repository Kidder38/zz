import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEquipmentForUser } from '../../services/equipmentService';
import { useAuth } from '../../auth/AuthContext';

const EquipmentSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getEquipmentForUser(currentUser);
        setEquipment(data);
      } catch (error) {
        console.error('Chyba při načítání zařízení:', error);
      }
    };

    if (currentUser) {
      fetchEquipment();
    }
  }, [currentUser]);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = equipment.filter(eq => 
        eq.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.current_location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEquipment(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredEquipment([]);
      setIsOpen(false);
    }
  }, [searchTerm, equipment]);

  const handleSelectEquipment = (equipmentId) => {
    navigate(`/equipment/${equipmentId}`);
    setSearchTerm('');
    setIsOpen(false);
    searchRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hledat zařízení..."
          className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Dropdown s výsledky */}
      {isOpen && filteredEquipment.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {filteredEquipment.map((eq) => (
            <button
              key={eq.id}
              onClick={() => handleSelectEquipment(eq.id)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🏗️</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {eq.manufacturer} {eq.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {eq.serial_number} • {eq.current_location || 'Bez lokace'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && searchTerm.length > 0 && filteredEquipment.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Nenalezena žádná zařízení
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentSearch;