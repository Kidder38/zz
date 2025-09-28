import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createOperator, updateOperator } from '../../services/operatorService';
import { getEquipment } from '../../services/equipmentService';

const OperatorSchema = Yup.object().shape({
  first_name: Yup.string().required('Jméno je povinné'),
  last_name: Yup.string().required('Příjmení je povinné'),
  operator_card_number: Yup.string()
    .matches(/^[A-Z0-9-]+$/, 'Číslo karty může obsahovat pouze velká písmena, číslice a pomlčky'),
  certification_valid_until: Yup.date()
    .min(new Date(), 'Datum platnosti certifikátu musí být v budoucnosti'),
  phone: Yup.string()
    .matches(/^[+0-9\s-()]+$/, 'Neplatný formát telefonu'),
  email: Yup.string().email('Neplatný email'),
  equipment_ids: Yup.array().of(Yup.number())
});

const OperatorForm = ({ initialValues, onSubmit, onCancel }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const data = await getEquipment();
        setEquipment(data);
      } catch (error) {
        console.error('Chyba při načítání zařízení:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []);

  const defaultValues = {
    first_name: '',
    last_name: '',
    operator_card_number: '',
    certification_valid_until: '',
    phone: '',
    email: '',
    equipment_ids: []
  };

  const formInitialValues = initialValues ? {
    ...defaultValues,
    ...initialValues,
    equipment_ids: initialValues.assigned_equipment 
      ? initialValues.assigned_equipment.map(eq => eq.equipment_id) 
      : []
  } : defaultValues;

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      console.log('Odesílám formulář s hodnotami:', values);
      
      // Clean up empty values
      const cleanValues = {};
      Object.keys(values).forEach(key => {
        if (values[key] !== '' && values[key] !== null && values[key] !== undefined) {
          if (Array.isArray(values[key])) {
            cleanValues[key] = values[key];
          } else {
            cleanValues[key] = values[key];
          }
        }
      });

      console.log('Vyčištěné hodnoty:', cleanValues);

      let result;
      if (initialValues?.id) {
        console.log('Aktualizuji existující obsluhu...');
        result = await updateOperator(initialValues.id, cleanValues);
      } else {
        console.log('Vytvářím novou obsluhu...');
        result = await createOperator(cleanValues);
      }
      
      console.log('Obsluha byla úspěšně uložena:', result);
      setStatus({ type: 'success', message: 'Obsluha byla úspěšně uložena' });
      
      // Zavolám callback
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Chyba při ukládání obsluhy:', error);
      setStatus({ type: 'error', message: 'Chyba při ukládání obsluhy: ' + (error.message || 'Neznámá chyba') });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  return (
    <div className="max-w-2xl">
      <Formik
        initialValues={formInitialValues}
        validationSchema={OperatorSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ isSubmitting, values, setFieldValue, status }) => (
          <Form className="space-y-6">
            {/* Status Messages */}
            {status && (
              <div className={`p-4 rounded-md ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.message}
              </div>
            )}
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Osobní údaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    Jméno *
                  </label>
                  <Field
                    type="text"
                    name="first_name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Příjmení *
                  </label>
                  <Field
                    type="text"
                    name="last_name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            {/* Certification */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Certifikace a oprávnění</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="operator_card_number" className="block text-sm font-medium text-gray-700">
                    Číslo průkazu obsluhy
                  </label>
                  <Field
                    type="text"
                    name="operator_card_number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Např. OP-2024-001"
                  />
                  <ErrorMessage name="operator_card_number" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="certification_valid_until" className="block text-sm font-medium text-gray-700">
                    Platnost certifikátu do
                  </label>
                  <Field
                    type="date"
                    name="certification_valid_until"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="certification_valid_until" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kontaktní údaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <Field
                    type="text"
                    name="phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="+420 123 456 789"
                  />
                  <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Field
                    type="email"
                    name="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="operator@example.com"
                  />
                  <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            {/* Equipment Assignment */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Přiřazená zařízení</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-md p-3">
                {equipment.length === 0 ? (
                  <p className="text-sm text-gray-500">Žádná zařízení nejsou k dispozici</p>
                ) : (
                  equipment.map((item) => (
                    <label key={item.id} className="flex items-center space-x-3">
                      <Field
                        type="checkbox"
                        name="equipment_ids"
                        value={item.id}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">
                          {item.manufacturer} {item.model}
                        </span>
                        <div className="text-xs text-gray-500">
                          {item.equipment_type} - {item.company_name}
                        </div>
                        {item.serial_number && (
                          <div className="text-xs text-gray-400">
                            SN: {item.serial_number}
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Vyberte zařízení, která může tato osoba obsluhovat
              </p>
            </div>

            {/* Certification Warning */}
            {values.certification_valid_until && (
              (() => {
                const certDate = new Date(values.certification_valid_until);
                const today = new Date();
                const daysDiff = (certDate - today) / (1000 * 60 * 60 * 24);
                
                if (daysDiff <= 30 && daysDiff >= 0) {
                  return (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            <strong>Upozornění:</strong> Certifikát vyprší za {Math.ceil(daysDiff)} dní. Zajistěte prodloužení certifikace.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else if (daysDiff < 0) {
                  return (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            <strong>Chyba:</strong> Certifikát již expiroval. Tato osoba nesmí obsluhovat zařízení.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Ukládám...' : (initialValues?.id ? 'Uložit změny' : 'Vytvořit obsluhu')}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OperatorForm;