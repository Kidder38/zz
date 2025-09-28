import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Modal from '../components/modals/Modal';
import RevisionForm from '../components/forms/RevisionForm';
import { 
  getRevisions, 
  getRevision, 
  createRevision, 
  updateRevision, 
  deleteRevision,
  getRevisionPdf 
} from '../services/revisionService';

const Revisions = () => {
  const location = useLocation();
  const [revisions, setRevisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentRevision, setCurrentRevision] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view', 'delete'
  const [initialEquipmentId, setInitialEquipmentId] = useState(null);

  // Načtení revizí
  useEffect(() => {
    fetchRevisions();
  }, []);
  
  // Zpracování navigačního stavu - otevření detailu nebo vytvoření nové revize
  useEffect(() => {
    const handleLocationState = async () => {
      // Pokud existuje location.state, zpracujeme ho
      if (location.state) {
        // Pokud přecházíme z detailu zařízení a máme viewId, načteme a zobrazíme revizi
        if (location.state.viewId) {
          try {
            setIsLoading(true);
            const revision = await getRevision(location.state.viewId);
            setCurrentRevision(revision);
            setModalMode('view');
            setModalOpen(true);
          } catch (err) {
            console.error('Chyba při načítání revize:', err);
            setError('Nepodařilo se načíst detail revize.');
          } finally {
            setIsLoading(false);
          }
        }
        // Pokud chceme vytvořit novou revizi a máme equipmentId
        else if (location.state.createNew && location.state.equipmentId) {
          setInitialEquipmentId(location.state.equipmentId);
          setModalMode('create');
          setModalOpen(true);
        }
        
        // Vyčistíme state, aby se modální okno neotevíralo při každém renderu
        window.history.replaceState({}, document.title);
      }
    };
    
    handleLocationState();
  }, [location]);

  const fetchRevisions = async () => {
    try {
      setIsLoading(true);
      const data = await getRevisions();
      setRevisions(data);
      setError(null);
    } catch (err) {
      setError('Nastala chyba při načítání revizí.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Otevření modálního okna pro vytvoření revize
  const handleAddClick = () => {
    setCurrentRevision(null);
    setModalMode('create');
    setModalOpen(true);
  };

  // Otevření modálního okna pro úpravu revize
  const handleEditClick = (revision) => {
    setCurrentRevision(revision);
    setModalMode('edit');
    setModalOpen(true);
  };

  // Otevření modálního okna pro detail revize
  const handleDetailClick = (revision) => {
    setCurrentRevision(revision);
    setModalMode('view');
    setModalOpen(true);
  };

  // Otevření modálního okna pro smazání revize
  const handleDeleteClick = (revision) => {
    setCurrentRevision(revision);
    setModalMode('delete');
    setModalOpen(true);
  };

  // Zavření modálního okna
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Vytvoření nebo úprava revize
  const handleSubmit = async (values) => {
    try {
      console.log('handleSubmit volán s hodnotami:', values);
      let response;
      
      if (modalMode === 'create') {
        console.log('Vytvářím novou revizi...');
        response = await createRevision(values);
        console.log('createRevision vrátil:', response);
      } else if (modalMode === 'edit') {
        console.log('Upravuji revizi ID:', currentRevision.id);
        response = await updateRevision(currentRevision.id, values);
        console.log('updateRevision vrátil:', response);
      }
      
      if (!response || !response.id) {
        console.error('Odpověď neobsahuje ID revize:', response);
        throw new Error('Server nevrátil správně formátovanou odpověď');
      }
      
      // Aktualizace seznamu revizí
      console.log('Aktualizuji seznam revizí...');
      fetchRevisions();
      
      // Zavření modálního okna
      console.log('Zavírám modální okno...');
      handleCloseModal();
    } catch (err) {
      setError(`Nastala chyba při ukládání revize: ${err.message || 'Neznámá chyba'}`);
      console.error('Chyba při ukládání revize:', err);
      if (err.response) {
        console.error('Detail server odpovědi:', err.response.data);
      }
    }
  };

  // Smazání revize
  const handleDelete = async () => {
    try {
      await deleteRevision(currentRevision.id);
      
      // Aktualizace seznamu revizí
      fetchRevisions();
      
      // Zavření modálního okna
      handleCloseModal();
    } catch (err) {
      setError('Nastala chyba při mazání revize.');
      console.error(err);
    }
  };

  // Stažení PDF revize
  const handleDownloadPdf = async (id) => {
    try {
      const response = await getRevisionPdf(id);
      
      // Zkontrolovat, zda jsme dostali blob
      if (!(response instanceof Blob)) {
        throw new Error('Neplatná odpověď ze serveru');
      }
      
      // Vytvoření URL objektu z blob dat
      const url = window.URL.createObjectURL(
        new Blob([response], { type: 'application/pdf' })
      );
      
      // Vytvoření odkazu pro stažení
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `revize-${id}.pdf`);
      
      // Aktivace stahování
      document.body.appendChild(link);
      link.click();
      
      // Čištění
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error(`Error downloading PDF for revision ${id}:`, err);
      setError('Nastala chyba při stahování PDF. ' + (err.message || ''));
    }
  };

  // Obsah modálního okna podle režimu
  const renderModalContent = () => {
    switch (modalMode) {
      case 'create':
      case 'edit':
        // Při vytváření nové revize můžeme mít předvyplněné ID zařízení, pokud přicházíme ze stránky zařízení
        const formInitialValues = modalMode === 'edit' 
          ? currentRevision 
          : initialEquipmentId 
            ? { equipment_id: initialEquipmentId } 
            : null;
            
        return (
          <RevisionForm
            initialValues={formInitialValues}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            selectedEquipment={null}
          />
        );
      case 'view':
        if (!currentRevision) return null;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zařízení</h4>
                <p className="mt-1">{currentRevision.equipment_type} {currentRevision.model}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Zákazník</h4>
                <p className="mt-1">{currentRevision.company_name}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Revizní technik</h4>
                <p className="mt-1">{currentRevision.technician_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Číslo osvědčení</h4>
                <p className="mt-1">{currentRevision.certification_number}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Datum revize</h4>
                <p className="mt-1">{new Date(currentRevision.revision_date).toLocaleDateString('cs-CZ')}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Příští revize</h4>
                <p className="mt-1">{new Date(currentRevision.next_revision_date).toLocaleDateString('cs-CZ')}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Příští inspekce</h4>
                <p className="mt-1">
                  {currentRevision.next_inspection_date 
                    ? new Date(currentRevision.next_inspection_date).toLocaleDateString('cs-CZ')
                    : "-"
                  }
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Vyhodnocení</h4>
              <p className="mt-1">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                  currentRevision.evaluation === 'Vyhovuje'
                    ? 'bg-green-100 text-green-800'
                    : currentRevision.evaluation === 'Vyhovuje s výhradami'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentRevision.evaluation}
                </span>
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Závěr</h4>
              <p className="mt-1">{currentRevision.conclusion || "-"}</p>
            </div>
            
            <div className="flex justify-between pt-4 mt-6">
              <div>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(currentRevision.id)}
                  className="btn btn-secondary mr-2"
                >
                  Stáhnout PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    handleEditClick(currentRevision);
                  }}
                  className="btn btn-secondary"
                >
                  Upravit
                </button>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="btn btn-primary"
              >
                Zavřít
              </button>
            </div>
          </div>
        );
      case 'delete':
        return (
          <div>
            <p className="mb-4">Opravdu chcete smazat revizi ze dne <strong>{currentRevision ? new Date(currentRevision.revision_date).toLocaleDateString('cs-CZ') : ''}</strong>?</p>
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

  // Nadpis modálního okna podle režimu
  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Nová revize';
      case 'edit':
        return 'Upravit revizi';
      case 'view':
        return 'Detail revize';
      case 'delete':
        return 'Smazat revizi';
      default:
        return '';
    }
  };

  // Získání barvy statusu podle vyhodnocení
  const getStatusColor = (evaluation) => {
    switch(evaluation) {
      case 'Vyhovuje':
        return 'bg-green-100 text-green-800';
      case 'Vyhovuje s výhradami':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Revize</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddClick}
        >
          Přidat revizi
        </button>
      </div>

      {/* Zobrazení chyby */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Zobrazení načítání */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {revisions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Žádné revize nebyly nalezeny</p>
              <button
                className="mt-4 px-4 py-2 text-sm text-primary hover:text-blue-800 underline"
                onClick={handleAddClick}
              >
                Přidat první revizi
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zařízení
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zákazník
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revizní technik
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Datum revize
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vyhodnocení
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revisions.map((revision) => (
                  <tr key={revision.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{revision.equipment_type}</div>
                      <div className="text-sm text-gray-500">{revision.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{revision.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{revision.technician_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(revision.revision_date).toLocaleDateString('cs-CZ')}</div>
                      <div className="text-sm text-gray-500">
                        Příští: {new Date(revision.next_revision_date).toLocaleDateString('cs-CZ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(revision.evaluation)}`}
                      >
                        {revision.evaluation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-primary hover:text-blue-800 mr-3"
                        onClick={() => handleDetailClick(revision)}
                      >
                        Detail
                      </button>
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleDownloadPdf(revision.id)}
                      >
                        PDF
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteClick(revision)}
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modální okno pro operace s revizemi */}
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

export default Revisions;