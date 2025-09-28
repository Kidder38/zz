import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createFaultReportEntry } from '../../services/logbookService';
import { getOperatorsForEquipment } from '../../services/operatorService';
import { getEquipmentItem } from '../../services/equipmentService';

const FaultReportSchema = Yup.object().shape({
  operator_id: Yup.number().required('Obsluha je povinná'),
  fault_type: Yup.string().required('Typ poruchy je povinný'),
  severity: Yup.string().required('Závažnost je povinná'),
  title: Yup.string().required('Název poruchy je povinný').max(255, 'Název je příliš dlouhý'),
  description: Yup.string().required('Popis poruchy je povinný'),
  immediate_action: Yup.string(),
  equipment_stopped: Yup.boolean(),
  shift: Yup.string(),
  notes: Yup.string()
});

const FaultReportForm = () => {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
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

        // Load equipment and operators
        const equipmentData = await getEquipmentItem(equipmentId);
        setEquipment(equipmentData);

        const operatorsData = await getOperatorsForEquipment(equipmentId);
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
    fault_type: '',
    severity: 'medium',
    title: '',
    description: '',
    immediate_action: '',
    equipment_stopped: false,
    shift: '',
    notes: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const entryData = {
        ...values,
        equipment_id: equipment.id,
        entry_date: new Date().toISOString().split('T')[0]
      };

      await createFaultReportEntry(entryData);
      navigate('/logbook');
    } catch (error) {
      console.error('Chyba při ukládání hlášení poruchy:', error);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Hlášení poruchy
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Nahlašujete poruchu nebo závadu na zařízení: <strong>{equipment.manufacturer} {equipment.model}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={FaultReportSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, values }) => (
          <Form className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Základní informace</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="operator_id" className="block text-sm font-medium text-gray-700">
                    Osoba nahlašující *
                  </label>
                  <Field
                    as="select"
                    name="operator_id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte osobu --</option>
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
              </div>
            </div>

            {/* Fault Details */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Podrobnosti poruchy</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="fault_type" className="block text-sm font-medium text-gray-700">
                    Typ poruchy *
                  </label>
                  <Field
                    as="select"
                    name="fault_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte typ --</option>
                    <option value="mechanical">Mechanická porucha</option>
                    <option value="electrical">Elektrická porucha</option>
                    <option value="safety">Bezpečnostní problém</option>
                    <option value="structural">Konstrukční problém</option>
                    <option value="operational">Provozní problém</option>
                  </Field>
                  <ErrorMessage name="fault_type" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
                    Závažnost *
                  </label>
                  <Field
                    as="select"
                    name="severity"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="low">Nízká (nepotřebuje okamžité řešení)</option>
                    <option value="medium">Střední (vyřešit v nejbližší době)</option>
                    <option value="high">Vysoká (vyřešit co nejdříve)</option>
                    <option value="critical">Kritická (okamžité zastavení provozu)</option>
                  </Field>
                  <ErrorMessage name="severity" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Název poruchy *
                </label>
                <Field
                  type="text"
                  name="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Stručný název poruchy..."
                />
                <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Podrobný popis poruchy *
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Popište co přesně se stalo, kdy se to stalo, za jakých okolností..."
                />
                <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="mb-4">
                <label htmlFor="immediate_action" className="block text-sm font-medium text-gray-700">
                  Okamžitá opatření
                </label>
                <Field
                  as="textarea"
                  name="immediate_action"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Co bylo provedeno okamžitě po zjištění poruchy..."
                />
              </div>

              <div className="flex items-center">
                <Field
                  type="checkbox"
                  name="equipment_stopped"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="equipment_stopped" className="ml-2 block text-sm text-gray-900">
                  Zařízení bylo zastaveno z důvodu bezpečnosti
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Dodatečné poznámky</h3>
              <Field
                as="textarea"
                name="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Další poznámky nebo informace..."
              />
            </div>

            {/* Equipment Stopped Warning */}
            {values.equipment_stopped && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Pozor:</strong> Zastavení zařízení z bezpečnostních důvodů. 
                      Informujte okamžitě nadřízeného a technický útvar.
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Odesílám...' : 'Nahlásit poruchu'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default FaultReportForm;