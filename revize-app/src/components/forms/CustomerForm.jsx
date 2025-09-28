import React from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';

const ContactPersonSchema = Yup.object().shape({
  name: Yup.string().required('Jméno je povinné'),
  email: Yup.string()
    .nullable()
    .transform(value => (value === '' ? null : value))
    .email('Neplatný formát e-mailu'),
  phone: Yup.string()
    .nullable()
    .transform(value => (value === '' ? null : value))
    .matches(/^(\+420)?\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$|^$/, 'Neplatný formát telefonního čísla'),
});

const CustomerSchema = Yup.object().shape({
  company_name: Yup.string()
    .required('Název společnosti je povinný'),
  ico: Yup.string()
    .nullable()
    .transform(value => (value === '' ? null : value))
    .matches(/^\d{8}$|^$/, 'IČ musí mít 8 číslic'),
  dic: Yup.string()
    .nullable()
    .transform(value => (value === '' ? null : value))
    .matches(/^CZ\d{8,10}$|^$/, 'DIČ musí být ve formátu CZ a 8-10 číslic'),
  street: Yup.string()
    .required('Ulice je povinná'),
  city: Yup.string()
    .required('Město je povinné'),
  postal_code: Yup.string()
    .required('PSČ je povinné')
    .test('valid-postal', 'PSČ musí mít 5 číslic (formát: 12345 nebo 123 45)', value => {
      // Odstranit mezery a zkontrolovat, zda výsledek má 5 číslic
      return !value || value.replace(/\s+/g, '').match(/^\d{5}$/);
    }),
  contact_persons: Yup.array().of(ContactPersonSchema),
});

const CustomerForm = ({ initialValues, onSubmit, onCancel }) => {
  const defaultValues = {
    company_name: '',
    ico: '',
    dic: '',
    street: '',
    city: '',
    postal_code: '',
    contact_persons: initialValues?.contact_persons || 
      (initialValues?.contact_person ? 
        [{
          name: initialValues.contact_person || '',
          email: initialValues.email || '',
          phone: initialValues.phone || ''
        }] : 
        [{
          name: '',
          email: '',
          phone: ''
        }]
      ),
    ...initialValues
  };

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={CustomerSchema}
      onSubmit={(values, actions) => {
        // Normalizovat PSČ - odstranit mezery
        const normalizedValues = {
          ...values,
          postal_code: values.postal_code.replace(/\s+/g, '')
        };
        onSubmit(normalizedValues, actions);
      }}
    >
      {({ isSubmitting, dirty, isValid, values }) => {
        // Debug info
        console.log('Form state:', { isSubmitting, dirty, isValid, values });
        
        return (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">Název společnosti</label>
                <Field
                  type="text"
                  name="company_name"
                  id="company_name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <ErrorMessage name="company_name" component="div" className="mt-1 text-sm text-red-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ico" className="block text-sm font-medium text-gray-700">IČ</label>
                  <Field
                    type="text"
                    name="ico"
                    id="ico"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <ErrorMessage name="ico" component="div" className="mt-1 text-sm text-red-600" />
                </div>
                
                <div>
                  <label htmlFor="dic" className="block text-sm font-medium text-gray-700">DIČ</label>
                  <Field
                    type="text"
                    name="dic"
                    id="dic"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                  <ErrorMessage name="dic" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="street" className="block text-sm font-medium text-gray-700">Ulice</label>
              <Field
                type="text"
                name="street"
                id="street"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
              <ErrorMessage name="street" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Město</label>
                <Field
                  type="text"
                  name="city"
                  id="city"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <ErrorMessage name="city" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">PSČ</label>
                <Field
                  type="text"
                  name="postal_code"
                  id="postal_code"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
                <ErrorMessage name="postal_code" component="div" className="mt-1 text-sm text-red-600" />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">Kontaktní osoby</h3>
              </div>
              
              <FieldArray name="contact_persons">
                {({ remove, push }) => (
                  <div>
                    {values.contact_persons.length > 0 &&
                      values.contact_persons.map((_, index) => (
                        <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-700">Kontaktní osoba {index + 1}</h4>
                            {values.contact_persons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-red-600 text-sm hover:text-red-800"
                              >
                                Odstranit
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label htmlFor={`contact_persons.${index}.name`} className="block text-sm font-medium text-gray-700">Jméno</label>
                              <Field
                                type="text"
                                name={`contact_persons.${index}.name`}
                                id={`contact_persons.${index}.name`}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                              />
                              <ErrorMessage name={`contact_persons.${index}.name`} component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`contact_persons.${index}.email`} className="block text-sm font-medium text-gray-700">E-mail</label>
                                <Field
                                  type="email"
                                  name={`contact_persons.${index}.email`}
                                  id={`contact_persons.${index}.email`}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                <ErrorMessage name={`contact_persons.${index}.email`} component="div" className="mt-1 text-sm text-red-600" />
                              </div>
                              
                              <div>
                                <label htmlFor={`contact_persons.${index}.phone`} className="block text-sm font-medium text-gray-700">Telefon</label>
                                <Field
                                  type="text"
                                  name={`contact_persons.${index}.phone`}
                                  id={`contact_persons.${index}.phone`}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                />
                                <ErrorMessage name={`contact_persons.${index}.phone`} component="div" className="mt-1 text-sm text-red-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    <button
                      type="button"
                      onClick={() => push({ name: '', email: '', phone: '' })}
                      className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      + Přidat kontaktní osobu
                    </button>
                  </div>
                )}
              </FieldArray>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {initialValues?.id ? 'Uložit změny' : 'Vytvořit zákazníka'}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default CustomerForm;