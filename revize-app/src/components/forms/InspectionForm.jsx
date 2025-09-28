import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getEquipment } from '../../services/equipmentService';

const InspectionSchema = Yup.object().shape({
  equipment_id: Yup.number().required('Zařízení je povinné'),
  inspector_name: Yup.string().required('Jméno inspektora je povinné'),
  inspection_date: Yup.date().required('Datum inspekce je povinné'),
  inspection_type: Yup.string().required('Typ inspekce je povinný'),
  findings: Yup.string(),
  recommendations: Yup.string(),
  next_inspection_date: Yup.date(),
});

const inspectionTypes = [
  { value: 'Pravidelná', label: 'Pravidelná' },
  { value: 'Mimořádná', label: 'Mimořádná' },
  { value: 'Kontrolní', label: 'Kontrolní' }
];

const InspectionForm = ({ initialValues, onSubmit, onCancel }) => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultValues = {
    equipment_id: '',
    inspector_name: '',
    inspection_date: new Date().toISOString().split('T')[0],
    inspection_type: 'Pravidelná',
    findings: '',
    recommendations: '',
    next_inspection_date: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
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
      validationSchema={InspectionSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, dirty, isValid }) => (
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
              <label htmlFor="inspector_name" className="block text-sm font-medium text-gray-700">Inspektor</label>
              <Field
                type="text"
                name="inspector_name"
                id="inspector_name"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="inspector_name" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="inspection_date" className="block text-sm font-medium text-gray-700">Datum inspekce</label>
              <Field
                type="date"
                name="inspection_date"
                id="inspection_date"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="inspection_date" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inspection_type" className="block text-sm font-medium text-gray-700">Typ inspekce</label>
              <Field
                as="select"
                name="inspection_type"
                id="inspection_type"
                className="mt-1 block w-full rounded-md"
              >
                {inspectionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="inspection_type" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="next_inspection_date" className="block text-sm font-medium text-gray-700">Datum příští inspekce</label>
              <Field
                type="date"
                name="next_inspection_date"
                id="next_inspection_date"
                className="mt-1 block w-full rounded-md"
              />
              <ErrorMessage name="next_inspection_date" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div>
            <label htmlFor="findings" className="block text-sm font-medium text-gray-700">Zjištění</label>
            <Field
              as="textarea"
              name="findings"
              id="findings"
              rows="4"
              className="mt-1 block w-full rounded-md"
            />
            <ErrorMessage name="findings" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div>
            <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">Doporučení</label>
            <Field
              as="textarea"
              name="recommendations"
              id="recommendations"
              rows="4"
              className="mt-1 block w-full rounded-md"
            />
            <ErrorMessage name="recommendations" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="flex justify-end space-x-3">
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
              {initialValues?.id ? 'Uložit změny' : 'Vytvořit inspekci'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default InspectionForm;