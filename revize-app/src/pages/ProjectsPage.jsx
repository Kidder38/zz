import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProjects, deleteProject, getProjectStatuses, getProjectPriorities } from '../services/projectService';
import { useAuth } from '../auth/AuthContext';
import { hasPermission } from '../auth/roles';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  });
  
  const { currentUser } = useAuth();
  const canEdit = hasPermission(currentUser?.role, 'projects', 'edit');
  const canDelete = hasPermission(currentUser?.role, 'projects', 'delete');

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects(filters);
      setProjects(data);
    } catch (error) {
      console.error('Chyba při načítání staveb:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteProject = async (project, event) => {
    event.preventDefault(); // Zabraň navigaci na detail
    event.stopPropagation();
    
    if (deleteConfirm === project.id) {
      try {
        await deleteProject(project.id);
        await fetchProjects(); // Reload projects
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Chyba při mazání stavby:', error);
        alert('Chyba při mazání stavby: ' + (error.error || 'Neznámá chyba'));
      }
    } else {
      setDeleteConfirm(project.id);
      // Auto-reset confirmation after 5 seconds
      setTimeout(() => {
        setDeleteConfirm(null);
      }, 5000);
    }
  };

  const getStatusInfo = (status) => {
    const statusInfo = getProjectStatuses().find(s => s.value === status);
    return statusInfo || { label: status, color: 'gray', icon: '❓' };
  };

  const getPriorityInfo = (priority) => {
    const priorityInfo = getProjectPriorities().find(p => p.value === priority);
    return priorityInfo || { label: priority, color: 'gray', icon: '❓' };
  };

  const getStatusClass = (color) => {
    const classes = {
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return classes[color] || classes.gray;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-500">Načítám stavby...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa staveb</h1>
            <p className="text-gray-600 mt-1">
              Přehled všech staveb a projektů s přiřazenými jeřáby
            </p>
          </div>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            ➕ Nová stavba
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">🔍 Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stav stavby
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Všechny stavy</option>
              {getProjectStatuses().map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorita
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Všechny priority</option>
              {getProjectPriorities().map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.icon} {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vyhledávání
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Název stavby, číslo, klient..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => {
          const statusInfo = getStatusInfo(project.status);
          const priorityInfo = getPriorityInfo(project.priority);
          
          return (
            <div
              key={project.id}
              className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {project.project_number}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(statusInfo.color)}`}>
                      <span className="mr-1">{statusInfo.icon}</span>
                      {statusInfo.label}
                    </span>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(priorityInfo.color)}`}>
                      <span className="mr-1">{priorityInfo.icon}</span>
                      {priorityInfo.label}
                    </span>
                  </div>
                </div>

                {/* Client & Location */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="mr-2">🏢</span>
                    <span className="font-medium">Klient:</span>
                    <span className="ml-2 text-gray-600">{project.client}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <span className="mr-2">📍</span>
                    <span className="font-medium">Lokace:</span>
                    <span className="ml-2 text-gray-600">{project.location.address}</span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Začátek</div>
                      <div className="font-medium">
                        {new Date(project.start_date).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Plánovaný konec</div>
                      <div className="font-medium">
                        {new Date(project.planned_end_date).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigned Equipment */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    🏗️ Přiřazené jeřáby ({project.assigned_equipment.length})
                  </div>
                  {project.assigned_equipment.length > 0 ? (
                    <div className="space-y-1">
                      {project.assigned_equipment.slice(0, 2).map((eq, index) => (
                        <div key={index} className="text-xs text-gray-600 flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                          {eq.model} ({eq.serial_number})
                        </div>
                      ))}
                      {project.assigned_equipment.length > 2 && (
                        <div className="text-xs text-gray-500">
                          ... a další {project.assigned_equipment.length - 2} jeřáby
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">
                      Žádné jeřáby nejsou přiřazeny
                    </div>
                  )}
                </div>

                {/* Project Manager */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="mr-2">👤</span>
                    <span className="text-gray-600">{project.project_manager}</span>
                  </div>
                  
                  <div className="text-gray-500">
                    {project.assigned_equipment.length} jeřábů
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      👁️ Detail
                    </Link>
                    {canEdit && (
                      <Link
                        to={`/projects/${project.id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        ✏️ Upravit
                      </Link>
                    )}
                  </div>
                  
                  {canDelete && (
                    <button
                      onClick={(e) => handleDeleteProject(project, e)}
                      className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md ${
                        deleteConfirm === project.id
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {deleteConfirm === project.id ? '🗑️ Potvrdit smazání' : '🗑️ Smazat'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Žádné stavby
          </h3>
          <p className="text-gray-500 mb-4">
            {Object.values(filters).some(f => f) 
              ? 'Nebyla nalezena žádná stavba odpovídající zadaným filtrům'
              : 'Zatím nemáte vytvořené žádné stavby'
            }
          </p>
          <Link
            to="/projects/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Vytvořit první stavbu
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;