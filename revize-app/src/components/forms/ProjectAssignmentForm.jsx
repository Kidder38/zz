import React, { useState, useEffect } from 'react';
import { getProjects, assignEquipmentToProject } from '../../services/projectService';
import { getUsers } from '../../services/userService';

const ProjectAssignmentForm = ({ equipmentId, currentProject, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_id: '',
    assigned_date: new Date().toISOString().split('T')[0],
    planned_removal_date: '',
    operator_id: '',
    operating_hours_start: '',
    notes: ''
  });
  
  const [availableProjects, setAvailableProjects] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, users] = await Promise.all([
          getProjects({ status: 'active,planned' }),
          getUsers({ role: 'operator' })
        ]);
        setAvailableProjects(projects);
        setOperators(users);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (currentProject) {
        // TODO: Implement project change/removal
        alert('Změna projektu bude implementována později');
        return;
      }

      const assignmentData = {
        equipment_id: parseInt(equipmentId),
        assigned_date: formData.assigned_date,
        planned_removal_date: formData.planned_removal_date || null,
        operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
        operating_hours_start: formData.operating_hours_start ? parseFloat(formData.operating_hours_start) : null,
        notes: formData.notes
      };

      await assignEquipmentToProject(formData.project_id, assignmentData);
      await onSubmit(assignmentData);
    } catch (error) {
      console.error('Chyba při přiřazování k projektu:', error);
      alert('Chyba při přiřazování k projektu: ' + (error.message || 'Neznámá chyba'));
    } finally {
      setLoading(false);
    }
  };

  if (currentProject) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            🏗️ Aktuální přiřazení
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium">
              {currentProject.project_name || currentProject.location_name}
            </p>
            <p className="text-blue-700 text-sm mt-1">
              {currentProject.project_number && `Číslo: ${currentProject.project_number}`}
            </p>
            <p className="text-blue-600 text-sm mt-2">
              Přiřazen od: {new Date(currentProject.assigned_date).toLocaleDateString('cs-CZ')}
            </p>
          </div>
          
          <div className="mt-6 space-y-3">
            <p className="text-gray-600 text-sm">
              Pro změnu projektu kontaktujte administrátora
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Zavřít
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          🏗️ Přiřadit k projektu
        </h3>
        <p className="text-gray-600 text-sm mt-1">
          Jeřáb není přiřazen k žádnému aktivnímu projektu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vybrat projekt *
          </label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">-- Vyberte projekt --</option>
            {availableProjects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name} ({project.project_number || 'bez čísla'})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum přiřazení *
            </label>
            <input
              type="date"
              name="assigned_date"
              value={formData.assigned_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plánovaný konec
            </label>
            <input
              type="date"
              name="planned_removal_date"
              value={formData.planned_removal_date}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Přiřadit operátora
          </label>
          <select
            name="operator_id"
            value={formData.operator_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Bez operátora --</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>
                {op.first_name} {op.last_name} ({op.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motohodiny při přiřazení
          </label>
          <input
            type="number"
            step="0.1"
            name="operating_hours_start"
            value={formData.operating_hours_start}
            onChange={handleChange}
            placeholder="aktuální stav motohodin"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poznámky
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="další informace k přiřazení..."
          />
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Přiřazuji...' : '🏗️ Přiřadit k projektu'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectAssignmentForm;