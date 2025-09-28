import React, { useState, useEffect } from 'react';
import { 
  createCraneRecord, 
  updateCraneRecord,
  getRecordCategories,
  getRecordTypes 
} from '../../services/craneRecordsService';
import { useAuth } from '../../auth/AuthContext';
import ControlChecklistForm from '../controls/ControlChecklistForm';
import RevisionForm from './RevisionForm';

const CraneRecordForm = ({ initialValues, selectedEquipment, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showControlChecklist, setShowControlChecklist] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  
  const [formData, setFormData] = useState({
    equipment_id: selectedEquipment?.id || '',
    record_category: 'control',
    record_type: 'daily',
    record_date: new Date().toISOString().split('T')[0],
    record_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
    title: '',
    description: '',
    findings: '',
    recommendations: '',
    corrective_actions: '',
    status: 'completed',
    result: 'passed',
    severity: 'info',
    operating_hours: '',
    weather_conditions: '',
    load_test_performed: false,
    load_test_weight: '',
    maintenance_required: false,
    revision_required: false
  });

  // Kontroluj, jestli se jedná o kontrolu - pokud ano, použij checklist komponentu
  const isControlRecord = formData.record_category === 'control' && !initialValues;
  const controlTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'];
  const isControlType = controlTypes.includes(formData.record_type);

  // Kontroluj, jestli se jedná o revizi - pokud ano, použij RevisionForm komponentu
  const isRevisionRecord = formData.record_category === 'revision' && !initialValues;
  const revisionTypes = ['post_montage', 'periodic_revision', 'extraordinary_revision'];
  const isRevisionType = revisionTypes.includes(formData.record_type);

  const recordCategories = getRecordCategories();
  const recordTypes = getRecordTypes();

  // Naplnění formuláře při editaci
  useEffect(() => {
    if (initialValues) {
      setFormData({
        equipment_id: initialValues.equipment_id || selectedEquipment?.id || '',
        record_category: initialValues.record_category || 'control',
        record_type: initialValues.record_type || 'daily',
        record_date: initialValues.record_date || new Date().toISOString().split('T')[0],
        record_time: initialValues.record_time || new Date().toTimeString().split(' ')[0].slice(0, 5),
        title: initialValues.title || '',
        description: initialValues.description || '',
        findings: initialValues.findings || '',
        recommendations: initialValues.recommendations || '',
        corrective_actions: initialValues.corrective_actions || '',
        status: initialValues.status || 'completed',
        result: initialValues.result || 'passed',
        severity: initialValues.severity || 'info',
        operating_hours: initialValues.operating_hours || '',
        weather_conditions: initialValues.weather_conditions || '',
        load_test_performed: initialValues.load_test_performed || false,
        load_test_weight: initialValues.load_test_weight || '',
        maintenance_required: initialValues.maintenance_required || false,
        revision_required: initialValues.revision_required || false
      });
    }
  }, [initialValues, selectedEquipment]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => {
      const newFormData = {
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Pokud se změnila kategorie, resetuj typ na první dostupný
      if (name === 'record_category') {
        const availableTypes = recordTypes.filter(recordType => recordType.category === value);
        if (availableTypes.length > 0) {
          newFormData.record_type = availableTypes[0].value;
        }
      }
      
      return newFormData;
    });
    
    // Vymaž chybu pro pole
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Název záznamu je povinný';
    }
    
    if (!formData.record_date) {
      newErrors.record_date = 'Datum je povinné';
    }
    
    if (formData.operating_hours && isNaN(parseFloat(formData.operating_hours))) {
      newErrors.operating_hours = 'Motohodiny musí být číslo';
    }
    
    if (formData.load_test_performed && (!formData.load_test_weight || isNaN(parseFloat(formData.load_test_weight)))) {
      newErrors.load_test_weight = 'Při zatěžkávací zkoušce je hmotnost povinná';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Debug: Zkontrolovat aktuálního uživatele
      console.log('🔍 Aktuální uživatel před odesláním:', currentUser);
      console.log('🔍 ID aktuálního uživatele:', currentUser?.id);
      
      const recordData = {
        ...formData,
        inspector_id: currentUser?.id,
        equipment_id: parseInt(formData.equipment_id),
        operating_hours: formData.operating_hours ? parseFloat(formData.operating_hours) : null,
        load_test_weight: formData.load_test_weight ? parseFloat(formData.load_test_weight) : null
      };

      if (initialValues) {
        await updateCraneRecord(initialValues.id, recordData);
      } else {
        await createCraneRecord(recordData);
      }

      await onSubmit();
    } catch (error) {
      console.error('Chyba při ukládání záznamu:', error);
      setErrors({ general: 'Došlo k chybě při ukládání záznamu' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrované typy podle kategorie
  const filteredTypes = recordTypes.filter(type => {
    return type.category === formData.record_category;
  });
  
  // Pokud je to nový kontrolní záznam s checklistem, použij ControlChecklistForm
  if (isControlRecord && isControlType && showControlChecklist) {
    return (
      <ControlChecklistForm
        controlType={formData.record_type}
        selectedEquipment={selectedEquipment}
        onSubmit={onSubmit}
        onCancel={() => setShowControlChecklist(false)}
      />
    );
  }

  // Pokud je to nový revizní záznam, použij RevisionForm
  if (isRevisionRecord && isRevisionType && showRevisionForm) {
    return (
      <RevisionForm
        initialValues={{
          equipment_id: selectedEquipment?.id,
          revision_type: formData.record_type,
          revision_date: formData.record_date,
          location: selectedEquipment?.current_location || ''
        }}
        onSubmit={async (revisionData) => {
          // Konvertuj RevisionForm data do formátu craneRecord
          const recordData = {
            equipment_id: selectedEquipment?.id,
            record_category: 'revision',
            record_type: formData.record_type,
            title: `${filteredTypes.find(t => t.value === formData.record_type)?.label} - ${selectedEquipment?.manufacturer} ${selectedEquipment?.model}`,
            description: revisionData.conclusion || revisionData.evaluation,
            findings: revisionData.technical_assessment ? Object.values(revisionData.technical_assessment).join('; ') : '',
            result: revisionData.evaluation === 'Vyhovuje' ? 'passed' : 'failed',
            status: 'completed',
            record_date: revisionData.revision_date,
            inspector_name: revisionData.technician_name,
            location_name: revisionData.location,
            revision_data: revisionData
          };
          
          await createCraneRecord(recordData);
          await onSubmit();
        }}
        onCancel={() => setShowRevisionForm(false)}
        selectedEquipment={selectedEquipment}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {errors.general}
        </div>
      )}

      {/* Základní informace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="record_category" className="block text-sm font-medium text-gray-700">
            Kategorie *
          </label>
          <select
            id="record_category"
            name="record_category"
            value={formData.record_category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {recordCategories.map(category => (
              <option key={category.value} value={category.value}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="record_type" className="block text-sm font-medium text-gray-700">
            Typ záznamu *
          </label>
          <select
            id="record_type"
            name="record_type"
            value={formData.record_type}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            {filteredTypes.length === 0 && (
              <option value="">Načítám typy...</option>
            )}
            {filteredTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tlačítko pro pokračování s checklistem u kontrolních záznamů */}
      {isControlRecord && isControlType && !showControlChecklist && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-blue-900">
                Strukturovaná kontrola - {filteredTypes.find(t => t.value === formData.record_type)?.label}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Pro tento typ kontroly je k dispozici strukturovaný checklist dle NV 193/2022.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowControlChecklist(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Spustit checklist
            </button>
          </div>
        </div>
      )}

      {/* Tlačítko pro pokračování s revizní formou u revizních záznamů */}
      {isRevisionRecord && isRevisionType && !showRevisionForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-green-900">
                Revizní protokol - {filteredTypes.find(t => t.value === formData.record_type)?.label}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Pro tento typ revize je k dispozici specializovaný formulář dle NV 193/2022 včetně technického posouzení a zatěžkávací zkoušky.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRevisionForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Spustit revizi
            </button>
          </div>
        </div>
      )}

      {/* Datum a čas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="record_date" className="block text-sm font-medium text-gray-700">
            Datum *
          </label>
          <input
            type="date"
            id="record_date"
            name="record_date"
            value={formData.record_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {errors.record_date && (
            <p className="mt-1 text-sm text-red-600">{errors.record_date}</p>
          )}
        </div>

        <div>
          <label htmlFor="record_time" className="block text-sm font-medium text-gray-700">
            Čas
          </label>
          <input
            type="time"
            id="record_time"
            name="record_time"
            value={formData.record_time}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Název */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Název záznamu *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Např. Denní kontrola před zahájením práce"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Popis */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Popis
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Detailní popis prováděné činnosti..."
        />
      </div>

      {/* Stav a výsledek */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Stav
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="planned">Plánováno</option>
            <option value="in_progress">Probíhá</option>
            <option value="completed">Dokončeno</option>
            <option value="overdue">Po termínu</option>
            <option value="failed">Neúspěšné</option>
          </select>
        </div>

        <div>
          <label htmlFor="result" className="block text-sm font-medium text-gray-700">
            Výsledek
          </label>
          <select
            id="result"
            name="result"
            value={formData.result}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="passed">Vyhovuje</option>
            <option value="passed_with_remarks">Vyhovuje s připomínkami</option>
            <option value="failed">Nevyhovuje</option>
            <option value="not_applicable">Neaplikovatelné</option>
          </select>
        </div>

        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Závažnost
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="info">Informativní</option>
            <option value="low">Nízká</option>
            <option value="medium">Střední</option>
            <option value="high">Vysoká</option>
            <option value="critical">Kritická</option>
          </select>
        </div>
      </div>

      {/* Zjištění */}
      <div>
        <label htmlFor="findings" className="block text-sm font-medium text-gray-700">
          Zjištění
        </label>
        <textarea
          id="findings"
          name="findings"
          rows={3}
          value={formData.findings}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Co bylo zjištěno během kontroly/inspekce..."
        />
      </div>

      {/* Doporučení a nápravná opatření */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">
            Doporučení
          </label>
          <textarea
            id="recommendations"
            name="recommendations"
            rows={3}
            value={formData.recommendations}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Doporučené kroky a opatření..."
          />
        </div>

        <div>
          <label htmlFor="corrective_actions" className="block text-sm font-medium text-gray-700">
            Nápravná opatření
          </label>
          <textarea
            id="corrective_actions"
            name="corrective_actions"
            rows={3}
            value={formData.corrective_actions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Jaká opatření byla přijata..."
          />
        </div>
      </div>

      {/* Technické údaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="operating_hours" className="block text-sm font-medium text-gray-700">
            Motohodiny
          </label>
          <input
            type="number"
            step="0.1"
            id="operating_hours"
            name="operating_hours"
            value={formData.operating_hours}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="1247.5"
          />
          {errors.operating_hours && (
            <p className="mt-1 text-sm text-red-600">{errors.operating_hours}</p>
          )}
        </div>

        <div>
          <label htmlFor="weather_conditions" className="block text-sm font-medium text-gray-700">
            Povětrnostní podmínky
          </label>
          <input
            type="text"
            id="weather_conditions"
            name="weather_conditions"
            value={formData.weather_conditions}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Jasno, bezvětří, 15°C"
          />
        </div>
      </div>

      {/* Zatěžkávací zkouška */}
      <div className="border-t pt-4">
        <div className="flex items-center mb-4">
          <input
            id="load_test_performed"
            name="load_test_performed"
            type="checkbox"
            checked={formData.load_test_performed}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="load_test_performed" className="ml-2 block text-sm font-medium text-gray-700">
            Byla provedena zatěžkávací zkouška
          </label>
        </div>

        {formData.load_test_performed && (
          <div>
            <label htmlFor="load_test_weight" className="block text-sm font-medium text-gray-700">
              Zkušební hmotnost (t) *
            </label>
            <input
              type="number"
              step="0.1"
              id="load_test_weight"
              name="load_test_weight"
              value={formData.load_test_weight}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="8.0"
            />
            {errors.load_test_weight && (
              <p className="mt-1 text-sm text-red-600">{errors.load_test_weight}</p>
            )}
          </div>
        )}
      </div>

      {/* Následné akce */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Následné akce</h4>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="maintenance_required"
              name="maintenance_required"
              type="checkbox"
              checked={formData.maintenance_required}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="maintenance_required" className="ml-2 block text-sm text-gray-700">
              Je nutná údržba
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="revision_required"
              name="revision_required"
              type="checkbox"
              checked={formData.revision_required}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="revision_required" className="ml-2 block text-sm text-gray-700">
              Je nutná mimořádná revize
            </label>
          </div>
        </div>
      </div>

      {/* Tlačítka */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Ukládám...' : (initialValues ? 'Uložit změny' : 'Vytvořit záznam')}
        </button>
      </div>
    </form>
  );
};

export default CraneRecordForm;