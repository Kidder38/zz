import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getEquipment } from '../../services/equipmentService';
import ServiceFiles from '../service/ServiceFiles';

const ServiceVisitSchema = Yup.object().shape({
  equipment_id: Yup.number().required('Zařízení je povinné'),
  technician_name: Yup.string().required('Jméno technika je povinné'),
  visit_date: Yup.date().required('Datum návštěvy je povinné'),
  hours_worked: Yup.number()
    .min(0, 'Hodnota musí být větší nebo rovna 0')
    .required('Odpracované hodiny jsou povinné'),
  description: Yup.string().required('Popis práce je povinný'),
  parts_used: Yup.string(),
  cost: Yup.number().min(0, 'Hodnota musí být větší nebo rovna 0'),
  invoiced: Yup.boolean(),
  invoice_number: Yup.string().when('invoiced', {
    is: true,
    then: Yup.string().required('Číslo faktury je povinné při fakturaci')
  }),
  notes: Yup.string(),
});

const ServiceVisitForm = ({ initialValues, onSubmit, onCancel }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultValues = {
    equipment_id: '',
    technician_name: '',
    visit_date: new Date().toISOString().split('T')[0],
    hours_worked: '',
    description: '',
    parts_used: '',
    cost: '',
    invoiced: false,
    invoice_number: '',
    notes: '',
    ...initialValues
  };

  // Načtení zařízení pro select
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

  if (loading) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={ServiceVisitSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, dirty, isValid, values, setFieldValue }) => (
        <Form className="space-y-6">
          <div>
            <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">Zařízení</label>
            <Field
              as="select"
              name="equipment_id"
              id="equipment_id"
              className="mt-1 block w-full rounded-md"
            >
              <option value="">-- Vyberte zařízení --</option>
              {equipment.map(item => (
                <option key={item.id} value={item.id}>
                  {item.equipment_type} {item.model} - {item.company_name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="equipment_id" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="technician_name" className="block text-sm font-medium text-gray-700">Technik</label>
              <Field
                type="text"
                name="technician_name"
                id="technician_name"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="technician_name" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700">Datum návštěvy</label>
              <Field
                type="date"
                name="visit_date"
                id="visit_date"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="visit_date" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hours_worked" className="block text-sm font-medium text-gray-700">Odpracované hodiny</label>
              <Field
                type="number"
                name="hours_worked"
                id="hours_worked"
                step="0.5"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="hours_worked" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Náklady (Kč)</label>
              <Field
                type="number"
                name="cost"
                id="cost"
                step="0.01"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="cost" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Popis prací</label>
            <Field
              as="textarea"
              name="description"
              id="description"
              rows="3"
              className="mt-1 block w-full rounded-md"
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="parts_used" className="block text-sm font-medium text-gray-700">Použité díly</label>
            <Field
              as="textarea"
              name="parts_used"
              id="parts_used"
              rows="2"
              className="mt-1 block w-full rounded-md"
            />
            <ErrorMessage name="parts_used" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="flex items-center space-x-2">
            <Field
              type="checkbox"
              name="invoiced"
              id="invoiced"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="invoiced" className="block text-sm font-medium text-gray-700">Fakturováno</label>
          </div>

          {values.invoiced && (
            <div>
              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">Číslo faktury</label>
              <Field
                type="text"
                name="invoice_number"
                id="invoice_number"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="invoice_number" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          )}

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Poznámky</label>
            <Field
              as="textarea"
              name="notes"
              id="notes"
              rows="2"
              className="mt-1 block w-full rounded-md"
            />
            <ErrorMessage name="notes" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          {/* Sekce pro nahrávání a zobrazení obrázků */}
          <ServiceFiles serviceId={initialValues?.id} serviceData={values} />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {initialValues?.id ? 'Uložit změny' : 'Vytvořit servisní výjezd'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ServiceVisitForm;