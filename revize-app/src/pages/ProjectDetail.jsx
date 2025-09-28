import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProject, assignEquipmentToProject, removeEquipmentFromProject, getAvailableEquipmentForProject, deleteProject } from '../services/projectService';
import { getUsers } from '../services/userService';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../auth/roles';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRemovalModal, setShowRemovalModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    equipment_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    planned_removal_date: '',
    operator_id: '',
    notes: ''
  });
  const [removalForm, setRemovalForm] = useState({
    actual_removal_date: new Date().toISOString().split('T')[0],
    removal_reason: '',
    final_operating_hours: '',
    notes: ''
  });

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectData, equipmentData, operatorData] = await Promise.all([
        getProject(id),
        getAvailableEquipmentForProject(),
        getUsers({ role: 'operator' })
      ]);
      
      setProject(projectData);
      setAvailableEquipment(equipmentData);
      setOperators(operatorData);
    } catch (error) {
      console.error('Chyba při načítání dat stavby:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignEquipment = async (e) => {
    e.preventDefault();
    
    try {
      await assignEquipmentToProject(id, assignmentForm);
      await fetchProjectData(); // Refresh data
      setShowAssignModal(false);
      setAssignmentForm({
        equipment_id: '',
        assigned_date: new Date().toISOString().split('T')[0],
        planned_removal_date: '',
        operator_id: '',
        notes: ''
      });
    } catch (error) {
      console.error('Chyba při přiřazování jeřábu:', error);
      alert('Chyba při přiřazování jeřábu: ' + (error.message || 'Neznámá chyba'));
    }
  };

  const handleRemoveEquipment = async (e) => {
    e.preventDefault();
    
    if (!selectedEquipment) return;
    
    try {
      await removeEquipmentFromProject(id, selectedEquipment.equipment_id, removalForm);
      await fetchProjectData(); // Refresh data
      setShowRemovalModal(false);
      setSelectedEquipment(null);
      setRemovalForm({
        actual_removal_date: new Date().toISOString().split('T')[0],
        removal_reason: '',
        final_operating_hours: '',
        notes: ''
      });
    } catch (error) {
      console.error('Chyba při odebírání jeřábu:', error);
      alert('Chyba při odebírání jeřábu: ' + (error.message || 'Neznámá chyba'));
    }
  };

  const openRemovalModal = (equipment) => {
    setSelectedEquipment(equipment);
    setShowRemovalModal(true);
  };

  const handleDeleteProject = async () => {
    if (deleteConfirm) {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Chyba při mazání stavby:', error);
        alert('Chyba při mazání stavby: ' + (error.error || 'Neznámá chyba'));
      }
    } else {
      setDeleteConfirm(true);
      // Auto-reset confirmation after 5 seconds
      setTimeout(() => {
        setDeleteConfirm(false);
      }, 5000);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      planned: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || classes.planned;
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: '📋',
      active: '🏗️',
      on_hold: '⏸️',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '❓';
  };

  const canEdit = hasPermission(currentUser?.role, 'projects', 'edit');
  const canDelete = hasPermission(currentUser?.role, 'projects', 'delete');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Načítám detail stavby...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Stavba nenalezena</h3>
        <Link to="/projects" className="text-blue-600 hover:text-blue-800">
          ← Zpět na přehled staveb
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(project.status)}`}>
                <span className="mr-1">{getStatusIcon(project.status)}</span>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600">{project.project_number}</p>
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              ➕ Přiřadit jeřáb
            </button>
            {canEdit && (
              <Link
                to={`/projects/${id}/edit`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                ✏️ Upravit
              </Link>
            )}
            {canDelete && (
              <button
                onClick={handleDeleteProject}
                className={`px-4 py-2 rounded-md font-medium ${
                  deleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-100 text-red-700 border border-red-300 hover:bg-red-200'
                }`}
              >
                {deleteConfirm ? '🗑️ Potvrdit smazání' : '🗑️ Smazat stavbu'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Project Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📋 Základní informace</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Klient</span>
              <p className="font-medium">{project.client}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Projektový manager</span>
              <p className="font-medium">{project.project_manager}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Stavbyvedoucí</span>
              <p className="font-medium">{project.site_manager || 'Nepřiřazen'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Kontakt klienta</span>
              <p className="font-medium">{project.client_contact}</p>
              <p className="text-sm text-gray-600">{project.client_phone}</p>
            </div>
          </div>
        </div>

        {/* Location & Timeline */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📍 Lokace a harmonogram</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500">Adresa stavby</span>
              <p className="font-medium">{project.location.address}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Začátek projektu</span>
              <p className="font-medium">
                {new Date(project.start_date).toLocaleDateString('cs-CZ')}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Plánovaný konec</span>
              <p className="font-medium">
                {new Date(project.planned_end_date).toLocaleDateString('cs-CZ')}
              </p>
            </div>
            {project.actual_end_date && (
              <div>
                <span className="text-sm text-gray-500">Skutečný konec</span>
                <p className="font-medium">
                  {new Date(project.actual_end_date).toLocaleDateString('cs-CZ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">⚠️ Speciální požadavky</h2>
          <p className="text-gray-600">
            {project.special_requirements || 'Žádné speciální požadavky'}
          </p>
        </div>
      </div>

      {/* Assigned Equipment */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          🏗️ Přiřazené jeřáby ({project.assigned_equipment.length})
        </h2>
        
        {project.assigned_equipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.assigned_equipment.map((equipment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {equipment.model}
                    </h3>
                    <p className="text-sm text-gray-500">{equipment.serial_number}</p>
                  </div>
                  
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    equipment.status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {equipment.status === 'operational' ? '✅ Provozní' : '⏸️ Neprovozní'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Operátor:</span>
                    <span className="ml-2 font-medium">{equipment.operator_name || 'Nepřiřazen'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Nasazení:</span>
                    <span className="ml-2">
                      {new Date(equipment.assigned_date).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Plán. demontáž:</span>
                    <span className="ml-2">
                      {new Date(equipment.planned_removal_date).toLocaleDateString('cs-CZ')}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link
                    to={`/equipment/${equipment.equipment_id}`}
                    className="flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded text-center hover:bg-blue-700"
                  >
                    Detail jeřábu
                  </Link>
                  <button
                    className="flex-1 bg-red-600 text-white text-xs px-3 py-2 rounded hover:bg-red-700"
                    onClick={() => openRemovalModal(equipment)}
                  >
                    Odebrat
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🏗️</div>
            <p className="text-gray-500 mb-4">Žádné jeřáby nejsou přiřazeny</p>
            <button
              onClick={() => setShowAssignModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Přiřadit první jeřáb
            </button>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Přiřadit jeřáb ke stavbě
            </h3>
            
            <form onSubmit={handleAssignEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vyberte jeřáb *
                </label>
                <select
                  value={assignmentForm.equipment_id}
                  onChange={(e) => setAssignmentForm(prev => ({
                    ...prev,
                    equipment_id: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Vyberte jeřáb --</option>
                  {availableEquipment.map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.model} ({eq.serial_number}) - {eq.current_location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum nasazení *
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.assigned_date}
                    onChange={(e) => setAssignmentForm(prev => ({
                      ...prev,
                      assigned_date: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plánovaná demontáž
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.planned_removal_date}
                    onChange={(e) => setAssignmentForm(prev => ({
                      ...prev,
                      planned_removal_date: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Přiřadit operátora
                </label>
                <select
                  value={assignmentForm.operator_id}
                  onChange={(e) => setAssignmentForm(prev => ({
                    ...prev,
                    operator_id: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Bez operátora --</option>
                  {operators.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.name} ({op.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poznámky
                </label>
                <textarea
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Další informace k přiřazení..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Přiřadit jeřáb
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pro odebrání jeřábu */}
      {showRemovalModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Odebrat jeřáb ze stavby
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {selectedEquipment && `${selectedEquipment.equipment_type} - ${selectedEquipment.model} (${selectedEquipment.serial_number})`}
              </p>
            </div>

            <form onSubmit={handleRemoveEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum odebrání *
                </label>
                <input
                  type="date"
                  required
                  value={removalForm.actual_removal_date}
                  onChange={(e) => setRemovalForm(prev => ({
                    ...prev,
                    actual_removal_date: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Důvod odebrání *
                </label>
                <select
                  required
                  value={removalForm.removal_reason}
                  onChange={(e) => setRemovalForm(prev => ({
                    ...prev,
                    removal_reason: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Vyberte důvod</option>
                  <option value="konec_projektu">Konec projektu</option>
                  <option value="porucha">Porucha zařízení</option>
                  <option value="revize">Plánovaná revize</option>
                  <option value="premisteni">Přemístění na jiný projekt</option>
                  <option value="jine">Jiné</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konečné motohodiny
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={removalForm.final_operating_hours}
                  onChange={(e) => setRemovalForm(prev => ({
                    ...prev,
                    final_operating_hours: e.target.value
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Počet motohodin při odebrání"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poznámky
                </label>
                <textarea
                  value={removalForm.notes}
                  onChange={(e) => setRemovalForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Další informace k odebrání..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Odebrat jeřáb
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRemovalModal(false);
                    setSelectedEquipment(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Zrušit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;