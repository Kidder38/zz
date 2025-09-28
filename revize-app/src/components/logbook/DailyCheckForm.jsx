import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getChecklistTemplate, createDailyCheckEntry } from '../../services/logbookService';
import { getOperatorsForEquipment } from '../../services/operatorService';
import { getEquipmentItem } from '../../services/equipmentService';

const DailyCheckSchema = Yup.object().shape({
  operator_id: Yup.number().required('Obsluha je povinná'),
  shift: Yup.string(),
  operating_hours: Yup.number().min(0, 'Motohodiny musí být kladné číslo'),
  weather_conditions: Yup.string(),
  notes: Yup.string()
});

const DailyCheckForm = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [checklistTemplate, setChecklistTemplate] = useState(null);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!equipmentId) {
          console.error('Equipment ID nenalezeno');
          setLoading(false);
          return;
        }

        // Load equipment, checklist template and operators
        const equipmentData = await getEquipmentItem(equipmentId);
        setEquipment(equipmentData);

        const [operatorsData] = await Promise.all([
          getOperatorsForEquipment(equipmentId)
        ]);

        // Načteme šablonu kontrolního seznamu
        console.log('Hledám šablonu pro typ zařízení:', equipmentData.equipment_type);
        const templateData = await getChecklistTemplate('daily', equipmentData.equipment_type);
        console.log('Nalezena šablona:', templateData);

        setChecklistTemplate(templateData[0] || null);
        setOperators(operatorsData);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipmentId]);

  const initialValues = {
    operator_id: '',
    shift: '',
    operating_hours: '',
    weather_conditions: '',
    notes: '',
    daily_checks: checklistTemplate?.items?.map(item => ({
      check_category: item.category,
      check_item: item.item_text,
      check_result: 'ok',
      notes: ''
    })) || []
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const entryData = {
        ...values,
        equipment_id: equipment.id,
        entry_date: new Date().toISOString().split('T')[0]
      };

      await createDailyCheckEntry(entryData);
      navigate('/logbook');
    } catch (error) {
      console.error('Chyba při ukládání denní kontroly:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/logbook');
  };

  if (loading) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  if (!checklistTemplate) {
    return (
      <div className="text-center py-4">
        <p>Šablona kontrolního seznamu nebyla nalezena.</p>
        <button onClick={handleCancel} className="btn btn-secondary mt-2">
          Zpět
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">
        Denní kontrola - {equipment.manufacturer} {equipment.model}
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={DailyCheckSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, values, setFieldValue }) => (
          <Form className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Základní informace</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="operator_id" className="block text-sm font-medium text-gray-700">
                    Obsluha *
                  </label>
                  <Field
                    as="select"
                    name="operator_id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte obsluhu --</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.id}>
                        {operator.first_name} {operator.last_name}
                        {operator.operator_card_number && ` (${operator.operator_card_number})`}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="operator_id" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
                    Směna
                  </label>
                  <Field
                    as="select"
                    name="shift"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte směnu --</option>
                    <option value="ranní">Ranní (6:00-14:00)</option>
                    <option value="odpolední">Odpolední (14:00-22:00)</option>
                    <option value="noční">Noční (22:00-6:00)</option>
                  </Field>
                </div>

                <div>
                  <label htmlFor="operating_hours" className="block text-sm font-medium text-gray-700">
                    Motohodiny
                  </label>
                  <Field
                    type="number"
                    step="0.1"
                    name="operating_hours"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="operating_hours" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="weather_conditions" className="block text-sm font-medium text-gray-700">
                    Povětrnostní podmínky
                  </label>
                  <Field
                    type="text"
                    name="weather_conditions"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Např. jasno, déšť, vítr..."
                  />
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Kontrolní seznam - {checklistTemplate.name}</h3>
              
              <div className="space-y-4">
                {checklistTemplate.items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.item_text}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {['ok', 'defect', 'not_applicable', 'not_checked'].map(result => (
                        <label key={result} className="flex items-center">
                          <Field
                            type="radio"
                            name={`daily_checks.${index}.check_result`}
                            value={result}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {result === 'ok' && 'Vyhovuje'}
                            {result === 'defect' && 'Závada'}
                            {result === 'not_applicable' && 'Netýká se'}
                            {result === 'not_checked' && 'Nezkontrolováno'}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div>
                      <Field
                        as="textarea"
                        name={`daily_checks.${index}.notes`}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Poznámky k této položce..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Notes */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Obecné poznámky</h3>
              <Field
                as="textarea"
                name="notes"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Obecné poznámky k denní kontrole..."
              />
              <ErrorMessage name="notes" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ukládám...' : 'Uložit kontrolu'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DailyCheckForm;