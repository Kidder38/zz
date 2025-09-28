import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getCustomers } from '../../services/customerService';

const EquipmentSchema = Yup.object().shape({
  customer_id: Yup.number()
    .required('Zákazník je povinný'),
  equipment_type: Yup.string()
    .required('Typ zařízení je povinný'),
  model: Yup.string()
    .required('Model je povinný'),
  manufacturer: Yup.string()
    .required('Výrobce je povinný'),
  year_of_manufacture: Yup.number()
    .min(1900, 'Neplatný rok výroby')
    .max(new Date().getFullYear(), 'Rok výroby nemůže být v budoucnosti')
    .required('Rok výroby je povinný'),
  serial_number: Yup.string()
    .required('Výrobní číslo je povinné'),
  inventory_number: Yup.string(),
  max_load: Yup.number()
    .min(0, 'Hodnota musí být větší než 0')
    .required('Maximální zatížení je povinné'),
  classification: Yup.string(),
  category: Yup.string(),
  equipment_class: Yup.string(),
});

// Kategorie zdvihacích zařízení dle § 3 NV 193/2022 Sb.
const equipmentCategories = [
  { value: 'a', label: 'a) Jeřáby a zdvihadla včetně kladkostrojů (nosnost > 1000 kg motor., > 5000 kg ruční)' },
  { value: 'b', label: 'b) Pracovní plošiny s motorickým pohonem (výška zdvihu > 1,5 m)' },
  { value: 'c', label: 'c) Výtahy pro dopravu osob/nákladu (nosnost > 100 kg, výška > 2 m)' },
  { value: 'd', label: 'd) Stavební výtahy pro přepravu osob a nákladu' },
  { value: 'e', label: 'e) Regálové zakladače se svisle pohyblivými stanovišti obsluhy' }
];

// Třídy zdvihacích zařízení dle § 4 NV 193/2022 Sb.
const equipmentClasses = [
  { value: 'I', label: 'I. třída - Jeřáby > 3200 kg, stavební výtahy, regálové zakladače' },
  { value: 'II', label: 'II. třída - Jeřáby 1000-3200 kg, výtahy > 100 kg, pracovní plošiny > 1,5 m' }
];

// Definice typů zařízení
const equipmentTypes = [
  { value: 'věžový jeřáb', label: 'Věžový jeřáb' },
  { value: 'samostavitelný jeřáb', label: 'Samostavitelný jeřáb' },
  { value: 'rychlostavitelný jeřáb', label: 'Rychlostavitelný jeřáb' },
  { value: 'mobilní jeřáb', label: 'Mobilní jeřáb' },
  { value: 'mostový jeřáb', label: 'Mostový jeřáb' },
  { value: 'portálový jeřáb', label: 'Portálový jeřáb' },
  { value: 'konzolový jeřáb', label: 'Konzolový jeřáb' },
  { value: 'sloupový jeřáb', label: 'Sloupový jeřáb' },
  { value: 'stavební výtah', label: 'Stavební výtah' },
  { value: 'nákladní výtah', label: 'Nákladní výtah' },
  { value: 'osobní výtah', label: 'Osobní výtah' },
  { value: 'plošina', label: 'Pracovní plošina' },
  { value: 'vysokozdvižný vozík', label: 'Vysokozdvižný vozík' },
  { value: 'jiné', label: 'Jiné' }
];

const EquipmentForm = ({ initialValues, onSubmit, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultValues = {
    customer_id: '',
    equipment_type: '',
    model: '',
    manufacturer: '',
    year_of_manufacture: new Date().getFullYear(),
    serial_number: '',
    inventory_number: '',
    max_load: '',
    classification: '',
    category: '',
    equipment_class: '',
    ...initialValues
  };

  // Načtení zákazníků pro select
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Chyba při načítání zákazníků:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  return (
    <Formik
      initialValues={defaultValues}
      validationSchema={EquipmentSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting, dirty, isValid }) => (
        <Form className="space-y-4">
          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700">Zákazník</label>
            <Field
              as="select"
              name="customer_id"
              id="customer_id"
              className="mt-1 block w-full"
            >
              <option value="">-- Vyberte zákazníka --</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.company_name}
                </option>
              ))}
            </Field>
            <ErrorMessage name="customer_id" component="div" className="mt-1 text-sm text-red-600" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="equipment_type" className="block text-sm font-medium text-gray-700">Typ zařízení</label>
              <Field
                as="select"
                name="equipment_type"
                id="equipment_type"
                className="mt-1 block w-full"
              >
                <option value="">-- Vyberte typ zařízení --</option>
                {equipmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="equipment_type" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
              <Field
                type="text"
                name="model"
                id="model"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="model" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">Výrobce</label>
              <Field
                type="text"
                name="manufacturer"
                id="manufacturer"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="manufacturer" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="year_of_manufacture" className="block text-sm font-medium text-gray-700">Rok výroby</label>
              <Field
                type="number"
                name="year_of_manufacture"
                id="year_of_manufacture"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="year_of_manufacture" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">Výrobní číslo</label>
              <Field
                type="text"
                name="serial_number"
                id="serial_number"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="serial_number" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="inventory_number" className="block text-sm font-medium text-gray-700">Inventární číslo</label>
              <Field
                type="text"
                name="inventory_number"
                id="inventory_number"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="inventory_number" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="max_load" className="block text-sm font-medium text-gray-700">Max. zatížení (t)</label>
              <Field
                type="number"
                name="max_load"
                id="max_load"
                step="0.1"
                className="mt-1 block w-full"
              />
              <ErrorMessage name="max_load" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="classification" className="block text-sm font-medium text-gray-700">Klasifikace</label>
              <Field
                type="text"
                name="classification"
                id="classification"
                className="mt-1 block w-full"
                placeholder="např. A1, H1/B3, A3"
              />
              <ErrorMessage name="classification" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Kategorie dle NV 193/2022 Sb.
              </label>
              <Field
                as="select"
                name="category"
                id="category"
                className="mt-1 block w-full"
              >
                <option value="">-- Vyberte kategorii --</option>
                {equipmentCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="category" component="div" className="mt-1 text-sm text-red-600" />
            </div>

            <div>
              <label htmlFor="equipment_class" className="block text-sm font-medium text-gray-700">
                Třída dle NV 193/2022 Sb.
              </label>
              <Field
                as="select"
                name="equipment_class"
                id="equipment_class"
                className="mt-1 block w-full"
              >
                <option value="">-- Vyberte třídu --</option>
                {equipmentClasses.map(cls => (
                  <option key={cls.value} value={cls.value}>
                    {cls.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="equipment_class" component="div" className="mt-1 text-sm text-red-600" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md mt-6">
            <p className="text-blue-700 mb-2 font-medium">Poznámka:</p>
            <p className="text-sm text-blue-600">
              Po vytvoření zařízení se automaticky otevře detail, kde budete moci přidat 
              konfigurace (výška zdvihu, vyložení), fotografie, technickou dokumentaci a další soubory.
            </p>
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
              disabled={isSubmitting || !dirty || !isValid}
              className="btn btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {initialValues?.id ? 'Uložit změny' : 'Vytvořit zařízení'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EquipmentForm;