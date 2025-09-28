import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EquipmentConfigSchema = Yup.object().shape({
  min_reach: Yup.number()
    .nullable()
    .transform(value => (isNaN(value) ? null : value))
    .min(0, 'Hodnota musí být větší než 0'),
  max_reach: Yup.number()
    .nullable()
    .transform(value => (isNaN(value) ? null : value))
    .min(0, 'Hodnota musí být větší než 0'),
  lift_height: Yup.number()
    .nullable()
    .transform(value => (isNaN(value) ? null : value))
    .min(0, 'Hodnota musí být větší než 0'),
  description: Yup.string()
    .required('Popis konfigurace je povinný'),
});

const EquipmentConfigForm = ({ initialValues, equipmentId, onSubmit, onCancel }) => {
  const defaultValues = {
    equipment_id: equipmentId || '',
    min_reach: '',
    max_reach: '',
    lift_height: '',
    description: '',
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={EquipmentConfigSchema}
      onSubmit={(values) => {
        onSubmit({
          ...values,
          equipment_id: equipmentId || values.equipment_id
        });
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="min_reach" className="block text-sm font-medium text-gray-700">Min. vyložení (m)</label>
              <Field
                type="number"
                name="min_reach"
                id="min_reach"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <ErrorMessage name="min_reach" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="max_reach" className="block text-sm font-medium text-gray-700">Max. vyložení (m)</label>
              <Field
                type="number"
                name="max_reach"
                id="max_reach"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <ErrorMessage name="max_reach" component="div" className="mt-1 text-sm text-red-600" />
            </div>
            
            <div>
              <label htmlFor="lift_height" className="block text-sm font-medium text-gray-700">Výška zdvihu (m)</label>
              <Field
                type="number"
                name="lift_height"
                id="lift_height"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <ErrorMessage name="lift_height" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Popis konfigurace</label>
            <Field
              as="textarea"
              name="description"
              id="description"
              rows="2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              placeholder="Např. Standardní konfigurace, Speciální konfigurace pro stavbu X, apod."
            />
            <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {initialValues?.id ? 'Uložit změny' : 'Přidat konfiguraci'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EquipmentConfigForm;