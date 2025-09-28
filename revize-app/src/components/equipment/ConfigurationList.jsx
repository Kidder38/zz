import React, { useState, useEffect } from 'react';
import Modal from '../modals/Modal';
import EquipmentConfigForm from '../forms/EquipmentConfigForm';
import { getConfigurationsForEquipment, createConfiguration, updateConfiguration, deleteConfiguration } from '../../services/equipmentConfigService';

const ConfigurationList = ({ equipmentId }) => {
  const [configurations, setConfigurations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'delete'

  useEffect(() => {
    if (equipmentId) {
      fetchConfigurations();
    } else {
      // Reset configurations if equipmentId is not available
      setConfigurations([]);
      setIsLoading(false);
    }
  }, [equipmentId]);

  const fetchConfigurations = async () => {
    try {
      setIsLoading(true);
      const data = await getConfigurationsForEquipment(equipmentId);
      setConfigurations(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání konfigurací.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentConfig(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEditClick = (config) => {
    setCurrentConfig(config);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (config) => {
    setCurrentConfig(config);
    setModalMode('delete');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'create') {
        await createConfiguration({ ...values, equipment_id: equipmentId });
      } else if (modalMode === 'edit') {
        await updateConfiguration(currentConfig.id, values);
      }
      
      // Aktualizace seznamu konfigurací
      fetchConfigurations();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při ukládání konfigurace.');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteConfiguration(currentConfig.id);
      
      // Aktualizace seznamu konfigurací
      fetchConfigurations();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání konfigurace.');
      console.error(err);
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create': return 'Přidat konfiguraci';
      case 'edit': return 'Upravit konfiguraci';
      case 'delete': return 'Smazat konfiguraci';
      default: return '';
    }
  };

  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
      case 'edit':
        return (
          <EquipmentConfigForm
            initialValues={currentConfig}
            equipmentId={equipmentId}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        );
      case 'delete':
        return (
          <div>
            <p className="mb-4">Opravdu chcete smazat konfiguraci <strong>"{currentConfig?.description}"</strong>?</p>
            <p className="mb-6 text-sm text-red-600">Tato akce je nevratná.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-secondary"
              >
                Zrušit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
              >
                Smazat
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Načítání konfigurací...</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-900">Konfigurace zařízení</h3>
        <button 
          className="btn btn-primary text-xs px-2 py-1"
          onClick={handleAddClick}
        >
          + Přidat konfiguraci
        </button>
      </div>

      {error && (
        <div className="p-3 mb-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {configurations.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
          <p>Zatím nejsou přidány žádné konfigurace</p>
          <button
            className="mt-2 text-sm text-primary hover:text-blue-800 underline"
            onClick={handleAddClick}
          >
            Přidat první konfiguraci
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {configurations.map((config) => (
            <div key={config.id} className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-md font-medium">{config.description}</h4>
                <div className="space-x-2">
                  <button 
                    className="text-indigo-600 text-xs hover:text-indigo-900"
                    onClick={() => handleEditClick(config)}
                  >
                    Upravit
                  </button>
                  <button 
                    className="text-red-600 text-xs hover:text-red-900"
                    onClick={() => handleDeleteClick(config)}
                  >
                    Smazat
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Min. vyložení:</span>{' '}
                  <span className="font-medium">{config.min_reach ? `${config.min_reach} m` : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Max. vyložení:</span>{' '}
                  <span className="font-medium">{config.max_reach ? `${config.max_reach} m` : '-'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Výška zdvihu:</span>{' '}
                  <span className="font-medium">{config.lift_height ? `${config.lift_height} m` : '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={getModalTitle()}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default ConfigurationList;