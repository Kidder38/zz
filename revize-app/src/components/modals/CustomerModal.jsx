import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const CustomerSchema = Yup.object().shape({
  company_name: Yup.string().required('Název společnosti je povinný'),
  ico: Yup.string()
    .matches(/^\d{8}$/, 'IČO musí obsahovat 8 číslic')
    .nullable(),
  dic: Yup.string()
    .matches(/^CZ\d{8,10}$/, 'DIČ musí být ve formátu CZ + 8-10 číslic')
    .nullable(),
  street: Yup.string(),
  city: Yup.string(),
  postal_code: Yup.string()
    .matches(/^\d{5}$/, 'PSČ musí obsahovat 5 číslic')
    .nullable()
});

const CustomerModal = ({ onSubmit, onCancel }) => {
  const initialValues = {
    company_name: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    postal_code: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Odstranit prázdné hodnoty
      const cleanValues = {};
      Object.keys(values).forEach(key => {
        if (values[key] !== '') {
          cleanValues[key] = values[key];
        }
      });
      
      await onSubmit(cleanValues);
    } catch (error) {
      console.error('Chyba při vytváření zákazníka:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Přidat nového zákazníka</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={CustomerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
                  Název společnosti *
                </label>
                <Field
                  type="text"
                  name="company_name"
                  id="company_name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <ErrorMessage name="company_name" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ico" className="block text-sm font-medium text-gray-700">
                    IČO
                  </label>
                  <Field
                    type="text"
                    name="ico"
                    id="ico"
                    placeholder="12345678"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="ico" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="dic" className="block text-sm font-medium text-gray-700">
                    DIČ
                  </label>
                  <Field
                    type="text"
                    name="dic"
                    id="dic"
                    placeholder="CZ12345678"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="dic" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  Ulice a číslo popisné
                </label>
                <Field
                  type="text"
                  name="street"
                  id="street"
                  placeholder="Hlavní 123"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <ErrorMessage name="street" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    Město
                  </label>
                  <Field
                    type="text"
                    name="city"
                    id="city"
                    placeholder="Praha"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                    PSČ
                  </label>
                  <Field
                    type="text"
                    name="postal_code"
                    id="postal_code"
                    placeholder="12000"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="postal_code" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Ukládám...' : 'Vytvořit zákazníka'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CustomerModal;