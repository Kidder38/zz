import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const EquipmentSchema = Yup.object().shape({
  customer_id: Yup.number().required('Zákazník je povinný'),
  equipment_type: Yup.string().required('Typ zařízení je povinný'),
  manufacturer: Yup.string().required('Výrobce je povinný'),
  model: Yup.string().required('Model je povinný'),
  year_of_manufacture: Yup.number()
    .min(1900, 'Rok výroby musí být nejméně 1900')
    .max(new Date().getFullYear() + 1, 'Rok výroby nemůže být v budoucnosti'),
  serial_number: Yup.string(),
  inventory_number: Yup.string(),
  max_load: Yup.number().min(0, 'Nosnost musí být kladné číslo'),
  classification: Yup.string(),
  category: Yup.string(),
  equipment_class: Yup.string()
});

const EquipmentModal = ({ customers, onSubmit, onCancel, onNewCustomer }) => {
  const initialValues = {
    customer_id: '',
    equipment_type: '',
    manufacturer: '',
    model: '',
    year_of_manufacture: new Date().getFullYear(),
    serial_number: '',
    inventory_number: '',
    max_load: '',
    classification: '',
    category: '',
    equipment_class: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Chyba při vytváření zařízení:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Přidat nové zařízení</h2>
        
        <Formik
          initialValues={initialValues}
          validationSchema={EquipmentSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, isValid }) => (
            <Form className="space-y-4">
              <div>
                <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">
                  Zákazník
                </label>
                <div className="flex gap-2">
                  <Field
                    as="select"
                    name="customer_id"
                    id="customer_id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte zákazníka --</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company_name}
                      </option>
                    ))}
                  </Field>
                  <button
                    type="button"
                    onClick={onNewCustomer}
                    className="mt-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    + Nový zákazník
                  </button>
                </div>
                <ErrorMessage name="customer_id" component="div" className="mt-1 text-sm text-red-600" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="equipment_type" className="block text-sm font-medium text-gray-700">
                    Typ zařízení
                  </label>
                  <Field
                    as="select"
                    name="equipment_type"
                    id="equipment_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte typ --</option>
                    <option value="Mostový jeřáb">Mostový jeřáb</option>
                    <option value="Portálový jeřáb">Portálový jeřáb</option>
                    <option value="Sloupový jeřáb">Sloupový jeřáb</option>
                    <option value="Konzolový jeřáb">Konzolový jeřáb</option>
                    <option value="Věžový jeřáb">Věžový jeřáb</option>
                    <option value="Automobilový jeřáb">Automobilový jeřáb</option>
                    <option value="Jiný">Jiný</option>
                  </Field>
                  <ErrorMessage name="equipment_type" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                    Výrobce
                  </label>
                  <Field
                    type="text"
                    name="manufacturer"
                    id="manufacturer"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="manufacturer" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                    Model
                  </label>
                  <Field
                    type="text"
                    name="model"
                    id="model"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="model" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="year_of_manufacture" className="block text-sm font-medium text-gray-700">
                    Rok výroby
                  </label>
                  <Field
                    type="number"
                    name="year_of_manufacture"
                    id="year_of_manufacture"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="year_of_manufacture" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">
                    Sériové číslo
                  </label>
                  <Field
                    type="text"
                    name="serial_number"
                    id="serial_number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="serial_number" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="inventory_number" className="block text-sm font-medium text-gray-700">
                    Inventární číslo
                  </label>
                  <Field
                    type="text"
                    name="inventory_number"
                    id="inventory_number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="inventory_number" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max_load" className="block text-sm font-medium text-gray-700">
                    Maximální nosnost (kg)
                  </label>
                  <Field
                    type="number"
                    name="max_load"
                    id="max_load"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <ErrorMessage name="max_load" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="classification" className="block text-sm font-medium text-gray-700">
                    Klasifikace
                  </label>
                  <Field
                    type="text"
                    name="classification"
                    id="classification"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="A1, A2, M3, apod."
                  />
                  <ErrorMessage name="classification" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Kategorie dle § 3 NV 193/2022
                  </label>
                  <Field
                    as="select"
                    name="category"
                    id="category"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte kategorii --</option>
                    <option value="jerab">Jeřáb dle § 3 odst. 1 písm. a)</option>
                    <option value="zdvihaci_plosina">Zdvihací plošina dle § 3 odst. 1 písm. b)</option>
                    <option value="stavebni_vytah">Stavební výtah dle § 3 odst. 1 písm. c)</option>
                  </Field>
                  <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
                </div>

                <div>
                  <label htmlFor="equipment_class" className="block text-sm font-medium text-gray-700">
                    Třída dle § 4 NV 193/2022
                  </label>
                  <Field
                    as="select"
                    name="equipment_class"
                    id="equipment_class"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">-- Vyberte třídu --</option>
                    <option value="I">I. třída (nosnost > 3200 kg nebo výška zdvihu > 30 m)</option>
                    <option value="II">II. třída (ostatní vyhrazená zdvihací zařízení)</option>
                  </Field>
                  <ErrorMessage name="equipment_class" component="div" className="mt-1 text-sm text-red-600" />
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
                  {isSubmitting ? 'Ukládám...' : 'Vytvořit zařízení'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default EquipmentModal;