import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProject, updateProject, getProject, getProjectStatuses, getProjectPriorities } from '../services/projectService';

const CreateProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [formData, setFormData] = useState({
    name: '',
    project_number: '',
    client: '',
    priority: 'medium',
    
    // Lokace stavby
    address: '',
    gps_latitude: '',
    gps_longitude: '',
    
    // Časový plán
    start_date: new Date().toISOString().split('T')[0],
    planned_end_date: '',
    
    // Kontaktní údaje
    project_manager: '',
    site_manager: '',
    client_contact: '',
    client_phone: '',
    
    // Popis a požadavky
    description: '',
    special_requirements: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      const loadProject = async () => {
        try {
          const project = await getProject(id);
          setFormData({
            name: project.name || '',
            project_number: project.project_number || '',
            client: project.client || '',
            priority: project.priority || 'medium',
            
            address: project.location?.address || '',
            gps_latitude: project.location?.gps_latitude || '',
            gps_longitude: project.location?.gps_longitude || '',
            
            start_date: project.start_date ? project.start_date.split('T')[0] : '',
            planned_end_date: project.planned_end_date ? project.planned_end_date.split('T')[0] : '',
            
            project_manager: project.project_manager || '',
            site_manager: project.site_manager || '',
            client_contact: project.client_contact || '',
            client_phone: project.client_phone || '',
            
            description: project.description || '',
            special_requirements: project.special_requirements || ''
          });
        } catch (error) {
          console.error('Chyba při načítání projektu:', error);
          alert('Chyba při načítání projektu');
          navigate('/projects');
        } finally {
          setInitialLoading(false);
        }
      };

      loadProject();
    }
  }, [isEdit, id, navigate]);

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
      const { address, gps_latitude, gps_longitude, ...otherFormData } = formData;
      
      const projectData = {
        ...otherFormData,
        location: {
          address: address,
          gps_latitude: gps_latitude ? parseFloat(gps_latitude) : null,
          gps_longitude: gps_longitude ? parseFloat(gps_longitude) : null
        }
      };

      let project;
      if (isEdit) {
        project = await updateProject(id, projectData);
      } else {
        project = await createProject(projectData);
      }
      navigate(`/projects/${project.id}`);
    } catch (error) {
      const actionText = isEdit ? 'aktualizaci' : 'vytváření';
      console.error(`Chyba při ${actionText} stavby:`, error);
      
      let errorMessage = 'Neznámá chyba';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.error) {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Chyba při ${actionText} stavby: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/projects');
  };

  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Načítám projekt...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Upravit stavbu' : 'Vytvořit novou stavbu'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Upravte informace o projektu' : 'Zadejte základní informace o novém projektu'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Základní informace */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📋 Základní informace</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název stavby *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="např. Wenceslas Square Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Číslo projektu
                </label>
                <input
                  type="text"
                  name="project_number"
                  value={formData.project_number}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pokud nevyplníte, vygeneruje se automaticky (např. PRJ-2025-001)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ponechte prázdné pro automatické vygenerování ve formátu PRJ-YYYY-XXX
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Klient *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="název firmy klienta"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorita
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {getProjectPriorities().map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.icon} {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lokace */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📍 Lokace stavby</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresa stavby *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="úplná adresa včetně města"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPS - Zeměpisná šířka
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="gps_latitude"
                    value={formData.gps_latitude}
                    onChange={handleChange}
                    placeholder="např. 50.0755"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPS - Zeměpisná délka
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="gps_longitude"
                    value={formData.gps_longitude}
                    onChange={handleChange}
                    placeholder="např. 14.4378"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Harmonogram */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📅 Harmonogram</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Začátek stavby *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plánovaný konec *
                </label>
                <input
                  type="date"
                  name="planned_end_date"
                  value={formData.planned_end_date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Kontaktní údaje */}
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">👥 Kontaktní údaje</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Projektový manager *
                </label>
                <input
                  type="text"
                  name="project_manager"
                  value={formData.project_manager}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jméno projektového managera"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stavbyvedoucí
                </label>
                <input
                  type="text"
                  name="site_manager"
                  value={formData.site_manager}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jméno stavbyvedoucího"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kontaktní osoba klienta
                </label>
                <input
                  type="text"
                  name="client_contact"
                  value={formData.client_contact}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="jméno kontaktní osoby"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon klienta
                </label>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+420 xxx xxx xxx"
                />
              </div>
            </div>
          </div>

          {/* Popis a požadavky */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">📝 Popis a požadavky</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Popis projektu
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="stručný popis stavby a jejího účelu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Speciální požadavky
                </label>
                <textarea
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="časové omezení, bezpečnostní požadavky, omezení hluku atd."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Vytváří se...' : '🏗️ Vytvořit stavbu'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;