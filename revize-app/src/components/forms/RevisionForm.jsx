import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { getEquipment, createEquipment } from '../../services/equipmentService';
import { getCustomers, createCustomer } from '../../services/customerService';
import { getConfigurationsForEquipment } from '../../services/configurationService';
import { createDefect, getDefectsByRevisionId } from '../../services/defectService';
import { createRevision, updateRevision } from '../../services/revisionService';
import { getCurrentProject } from '../../services/equipmentLocationService';
import { getProjects } from '../../services/projectService';
import EquipmentModal from '../modals/EquipmentModal';
import CustomerModal from '../modals/CustomerModal';
import DateInput from '../common/DateInput';

const RevisionSchema = Yup.object().shape({
  equipment_id: Yup.number().required('Zařízení je povinné'),
  configuration_id: Yup.number().nullable(),
  technician_name: Yup.string().required('Jméno technika je povinné'),
  certification_number: Yup.string().required('Číslo osvědčení je povinné'),
  revision_date: Yup.date().required('Datum revize je povinné'),
  test_start_date: Yup.date(),
  test_end_date: Yup.date(),
  report_date: Yup.date(),
  handover_date: Yup.date(),
  evaluation: Yup.string().required('Vyhodnocení je povinné'),
  next_revision_date: Yup.date().required('Datum další revize je povinné'),
  next_inspection_date: Yup.date(),
  documentation_check: Yup.object(),
  equipment_check: Yup.object(),
  functional_test: Yup.object(),
  load_test: Yup.object(),
  conclusion: Yup.string(),
  location: Yup.string().required('Umístění jeřábu je povinné'),
  custom_location: Yup.string(),
  revision_number: Yup.string().matches(/^RE[0-9]{6}$/, 'Číslo revize musí být ve formátu RE000001'),
  
  // Nová pole dle NV 193/2022 Sb.
  measuring_instruments: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Název přístroje je povinný'),
      range: Yup.string().required('Rozsah je povinný'),
      purpose: Yup.string().required('Účel použití je povinný'),
    })
  ),
  technical_assessment: Yup.object().shape({
    structure: Yup.string(),
    safety: Yup.string(),
    mechanisms: Yup.string(),
    electrical: Yup.string(),
    protection: Yup.string(),
    documentation: Yup.string(),
  }),
  defects: Yup.array().of(
    Yup.object().shape({
      section: Yup.string().required(),
      item_key: Yup.string().required(),
      item_name: Yup.string().required(),
      description: Yup.string().required('Popis závady je povinný'),
      severity: Yup.string().oneOf(['low', 'medium', 'high'], 'Vyberte závažnost závady'),
    })
  ),
  dangers: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Popis nebezpečí je povinný'),
      risk_level: Yup.string().oneOf(['low', 'medium', 'high'], 'Vyberte úroveň rizika'),
    })
  ),
  previous_controls_ok: Yup.boolean(),
  technical_trend: Yup.string(),
  procedure_type: Yup.string().required('Typ úkonu je povinný'),
});

// Typy úkonů dle § 8 NV 193/2022 Sb.
const procedureTypeOptions = [
  { value: 'ZKOUŠKA', label: 'Zkouška (pravidelná zkouška)' },
  { value: 'MIMOŘÁDNÁ_ZKOUŠKA', label: 'Mimořádná zkouška (po podstatné změně, přemístění, po opravě)' },
  { value: 'ZKOUŠKA_PO_OPRAVĚ', label: 'Zkouška po opravě (po odstranění závad)' }
];

// Možnosti pro vyhodnocení dle § 9 písm. k)
const evalOptions = [
  { value: 'VYHOVUJE', label: 'Technický stav splňuje požadavky bezpečného a spolehlivého provozu' },
  { value: 'NEVYHOVUJE', label: 'Technický stav nesplňuje požadavky bezpečného a spolehlivého provozu' }
];

// Definice stavů odpovědí pro jednotlivé položky revize
const checkResponses = {
  documentation: ['Předložen', 'Nepředložen', 'Není součástí'],
  equipment: ['Vyhovuje', 'Nevyhovuje', 'Není součástí'],
  functional: ['Vyhovuje', 'Nevyhovuje', 'Není součástí'], 
  load: ['Vyhovuje', 'Nevyhovuje', 'Není součástí']
};

// Definice závažnosti závad
const defectSeverityOptions = [
  { value: 'low', label: 'Nízká' },
  { value: 'medium', label: 'Střední' },
  { value: 'high', label: 'Vysoká' }
];

// Data pro kontrolní seznamy podle § 9 písm. g) NV 193/2022 Sb.
const documentationItems = {
  pruvodka_jerabu: 'Průvodní dokumentace jeřábu',
  denik_zz: 'Provozní deník zdvihacího zařízení', 
  sbp: 'Systém bezpečné práce (SBP)',
  dokumentace_strojni_el: 'Výkresová dokumentace strojní a elektrické části',
  vychozi_revize_el: 'Zápis o výchozí revizi elektrického zařízení',
  posledni_revize_el: 'Zápis o poslední revizi elektrického zařízení',
  posledni_revize_jer: 'Zápis o poslední provedené revizi jeřábu',
  posledni_inspekce: 'Zápis o poslední provedené inspekci',
  navod_obsluha: 'Návod na obsluhu jeřábu',
  prohlidky_ocel_konstrukce: 'Zápisy o prohlídkách nosných konstrukcí dle ČSN 73 2604',
  kotveni: 'Technická dokumentace základu nebo kotvení jeřábu'
};

// Vizuální prohlídka dle ČSN 27 0142/2023 
const equipmentItems = {
  navod_dostupnost: 'Dostupnost návodu výrobce',
  zapisy_denik: 'Provádění zápisů v deníku',
  udrzba_mazani: 'Údržba a mazání',
  pristupy_stanoviste: 'Přístupy a stanoviště obsluhy',
  nosna_konstrukce: 'Nosná konstrukce (svary, spoje, koroze)',
  nosne_organy: 'Nosné orgány, háky, kladnice',
  hasici_pristroj: 'Hasící přístroj',
  oznaceni: 'Označení a výstražná zařízení',
  ukazatel_vylozeni: 'Ukazatel vyložení',
  komunikace: 'Komunikační systémy'
};

// Funkční zkouška dle ČSN 27 0142/2023
const functionalItems = {
  ovladaci_zarizeni: 'Ovládací zařízení',
  zabezpecovaci_zarizeni: 'Zabezpečovací zařízení',
  technologicka_zarizeni: 'Technologická zařízení',
  funkce_stop: 'Funkce STOP',
  pohybove_mechanismy: 'Pohybové mechanismy a brzdy',
  omezovace: 'Omezovací a indikační zařízení',
  dalkove_ovladani: 'Dálkové ovládání'
};

// Zkoušky se zatížením dle ČSN 27 0142/2023
const loadItems = {
  dynamicka_zkouska: 'Dynamická zkouška (1,1x nosnost)',
  omezovac_nosnosti: 'Zkouška omezovače nosnosti (115%)'
};

// Vytvoření výchozích hodnot pro kontrolní seznamy
const createDefaultChecks = (items, type = 'equipment') => {
  const result = {};
  const defaultValue = type === 'documentation' ? 'Předložen' : 'Vyhovuje';
  Object.keys(items).forEach(key => {
    result[key] = defaultValue;
  });
  return result;
};

// Vypočítáme další číslo revize (RE000XXX)
const generateNextRevisionNumber = () => {
  // Get the current time
  const now = new Date();
  // Get last 6 digits of the timestamp
  const lastDigits = now.getTime().toString().slice(-6);
  // Format as RE + 6 digits
  return `RE${lastDigits}`;
};

// Základní výchozí hodnoty
const baseDefaultValues = {
  equipment_id: '',
  configuration_id: '',
  category: '',
  equipment_class: '',
  equipment_type: '',
  model: '',
  technician_name: 'Lukáš Holubčák',
  certification_number: '156/23/R, Z-ZZ-a, a1, a2, a3',
  revision_date: new Date().toISOString().split('T')[0],
  start_date: new Date().toISOString().split('T')[0],
  test_start_date: new Date().toISOString().split('T')[0],
  test_end_date: new Date().toISOString().split('T')[0],
  report_date: new Date().toISOString().split('T')[0],
  handover_date: new Date().toISOString().split('T')[0],
  evaluation: evalOptions[0].value,
  next_revision_date: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
  next_inspection_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  documentation_check: createDefaultChecks(documentationItems, 'documentation'),
  equipment_check: createDefaultChecks(equipmentItems, 'equipment'),
  functional_test: createDefaultChecks(functionalItems, 'equipment'), 
  load_test: createDefaultChecks(loadItems, 'equipment'),
  conclusion: 'Revizní technik neodpovídá za případné škody na zdraví či majetku způsobené provozem jeřábu, vadami materiálu, neodbornou manipulací, příp. zásahem neoprávněných osob do konstrukce a mechanizmů jeřábu po dni revize.',
  location: '',
  custom_location: '',
  revision_number: generateNextRevisionNumber(),
  defects: [],
  
  // Nová pole dle NV 193/2022 Sb.
  measuring_instruments: [
    { name: 'Posuvné měřidlo analogové', range: '0-200mm', purpose: 'Měření rozměrů' },
    { name: 'Posuvné měřidlo analogové', range: '0-500mm', purpose: 'Měření rozměrů' },
    { name: 'Hloubkoměr analogový', range: '0-200mm', purpose: 'Měření hloubek' },
    { name: 'Ocelový svinovací metr', range: '5 m', purpose: 'Měření délek' },
    { name: 'Laserový měřicí přístroj', range: '-', purpose: 'Přesné měření' },
    { name: 'Jeřábová váha', range: '-', purpose: 'Zkouška zatížením' },
    { name: 'Nářadí a pomůcky', range: '-', purpose: 'Montáž/demontáž' },
  ],
  technical_assessment: {
    structure: 'Bez viditelných poškození, koroze nebo deformací',
    safety: 'Všechny funkční, správně seřízené',
    mechanisms: 'Plynulý chod, účinné brzdění',
    electrical: 'Bez závad, správná funkce',
    protection: 'Funkční, odpovídají požadavkům',
    documentation: 'Kompletní, aktuální',
  },
  dangers: [],
  previous_controls_ok: true,
  technical_trend: 'Stabilní, bez zhoršujících se parametrů',
  procedure_type: 'ZKOUŠKA',
};

const RevisionForm = ({ initialValues, onSubmit, onCancel, selectedEquipment }) => {
  const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defects, setDefects] = useState([]);
  const [defectsLoaded, setDefectsLoaded] = useState(false);
  const [formInitValues, setFormInitValues] = useState(null);
  
  // Pro přidávání nového zařízení
  const [customers, setCustomers] = useState([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Pro konfigurace zařízení
  const [configurations, setConfigurations] = useState([]);

  // Načtení závad pro existující revizi
  useEffect(() => {
    const fetchDefects = async () => {
      if (initialValues?.id) {
        try {
          const data = await getDefectsByRevisionId(initialValues.id);
          setDefects(data);
        } catch (error) {
          console.error(`Chyba při načítání závad pro revizi ${initialValues.id}:`, error);
        }
      }
      setDefectsLoaded(true);
    };
    
    fetchDefects();
  }, [initialValues?.id]);

  // Načtení zařízení a projektů pro select
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [equipmentData, projectsData] = await Promise.all([
          getEquipment(),
          getProjects() // Načíst všechny projekty
        ]);
        setEquipment(equipmentData);
        setProjects(projectsData);
      } catch (error) {
        console.error('Chyba při načítání dat:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Načtení zákazníků pro formulář zařízení
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (error) {
        console.error('Chyba při načítání zákazníků:', error);
      }
    };

    fetchCustomers();
  }, []);

  // Načtení konfigurací při inicializaci pro existující revizi
  useEffect(() => {
    const fetchConfigurationsForExisting = async () => {
      if (initialValues?.equipment_id) {
        try {
          const configs = await getConfigurationsForEquipment(initialValues.equipment_id);
          setConfigurations(configs);
        } catch (error) {
          console.error('Chyba při načítání konfigurací:', error);
          setConfigurations([]);
        }
      }
    };

    fetchConfigurationsForExisting();
  }, [initialValues?.equipment_id]);

  // Příprava initiálních hodnot formuláře
  useEffect(() => {
    if (!defectsLoaded) return;
    
    // Vytvoření úplných defaultních hodnot včetně kontrolních seznamů
    const fullDefaultValues = {
      ...baseDefaultValues,
      documentation_check: createDefaultChecks(documentationItems, 'documentation'),
      equipment_check: createDefaultChecks(equipmentItems, 'equipment'),
      functional_test: createDefaultChecks(functionalItems, 'equipment'),
      load_test: createDefaultChecks(loadItems, 'equipment'),
    };
    
    // Kombinace základních hodnot s initialValues
    const mergedValues = {
      ...fullDefaultValues,
      ...(initialValues || {}),
    };
    
    // Ověříme, že všechny JSONB pole mají správná data
    const checkJSONBFields = ['documentation_check', 'equipment_check', 'functional_test', 'load_test'];
    checkJSONBFields.forEach(field => {
      // Pokud pole neexistuje nebo není objekt, použijeme výchozí hodnoty
      if (!mergedValues[field] || typeof mergedValues[field] !== 'object') {
        console.log(`Field ${field} chybí nebo není objekt, nastavuji výchozí hodnoty`);
        if (field === 'documentation_check') mergedValues[field] = createDefaultChecks(documentationItems, 'documentation');
        if (field === 'equipment_check') mergedValues[field] = createDefaultChecks(equipmentItems, 'equipment');
        if (field === 'functional_test') mergedValues[field] = createDefaultChecks(functionalItems, 'equipment');
        if (field === 'load_test') mergedValues[field] = createDefaultChecks(loadItems, 'equipment');
      }
    });
    
    // Přidáme načtené závady
    mergedValues.defects = defects || [];
    
    // Označíme všechny položky, ke kterým existují závady, jako "Nevyhovuje"
    if (defects && defects.length > 0) {
      defects.forEach(defect => {
        if (defect.section && defect.item_key && mergedValues[defect.section]) {
          mergedValues[defect.section][defect.item_key] = 'Nevyhovuje';
        }
      });
    }
    
    console.log('Finální hodnoty formuláře:', mergedValues);
    setFormInitValues(mergedValues);
  }, [initialValues, defectsLoaded, defects]);

  // Funkce pro získání geolokace
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolokace není podporována tímto prohlížečem'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Chyba při získávání geolokace:', error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Handler pro tlačítko "Získat aktuální polohu"
  const handleGetLocation = async (setFieldValue) => {
    try {
      const { latitude, longitude } = await getLocation();
      const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      
      setFieldValue('location', locationText);
      
      // Použijeme nenápadnou notifikaci místo alert
      const notification = document.createElement('div');
      notification.textContent = `✅ Poloha získána: ${locationText}`;
      notification.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#4CAF50; color:white; padding:10px; border-radius:5px; z-index:9999; box-shadow:0 2px 5px rgba(0,0,0,0.2);';
      document.body.appendChild(notification);
      
      // Odstranit notifikaci po 3 sekundách
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
      
    } catch (error) {
      console.error('Chyba geolokace:', error);
      
      let errorMessage = 'Nepodařilo se získat polohu.';
      
      // Přizpůsobení chybové zprávy podle typu chyby
      if (error.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Pro získání polohy je potřeba povolit přístup k poloze v prohlížeči.';
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Aktuální poloha není dostupná. Zkuste to později nebo zadejte polohu ručně.';
      } else if (error.code === 3) { // TIMEOUT
        errorMessage = 'Vypršel časový limit pro získání polohy. Zkuste to znovu nebo zadejte polohu ručně.';
      }
      
      // Vytvoření modálního okna pro chybu
      const errorDiv = document.createElement('div');
      errorDiv.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;">
          <div style="background:white; padding:20px; border-radius:5px; max-width:400px; text-align:center;">
            <h3 style="margin-top:0; color:#e53e3e;">Problém s geolokací</h3>
            <p>${errorMessage}</p>
            <p style="margin-bottom:0; font-size:0.9em;">Můžete zadat polohu ručně nebo zkontrolovat nastavení polohy v prohlížeči.</p>
            <div style="margin-top:15px;">
              <button id="closeGeolocationError" style="background:#4299e1; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Rozumím</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      
      // Přidání event listeneru pro zavření modálního okna
      document.getElementById('closeGeolocationError').addEventListener('click', function() {
        document.body.removeChild(errorDiv);
      });
    }
  };

  // Handler pro tlačítko "Načíst lokaci zařízení"
  const handleLoadEquipmentLocation = async (setFieldValue, values) => {
    try {
      const equipmentId = values.equipment_id;
      if (!equipmentId) {
        alert('Nejdřív vyberte zařízení');
        return;
      }
      
      // Získat aktuální projekt/lokaci zařízení
      const currentProject = await getCurrentProject(equipmentId);
      
      let locationText = '';
      
      if (currentProject && currentProject.project) {
        // Sestavit lokaci z projektu
        locationText = `${currentProject.project.name}`;
        if (currentProject.project.location) {
          locationText += ` - ${currentProject.project.location}`;
        }
        if (currentProject.project.address) {
          locationText += `, ${currentProject.project.address}`;
        }
      } else if (selectedEquipment) {
        // Fallback - použít údaje ze zařízení
        const selectedEquipmentData = equipment.find(eq => eq.id === parseInt(equipmentId));
        if (selectedEquipmentData?.company_name) {
          locationText = selectedEquipmentData.company_name;
        }
      }
      
      if (locationText) {
        setFieldValue('location', locationText);
        
        // Zobrazit notifikaci
        const notification = document.createElement('div');
        notification.textContent = `✅ Lokace načtena: ${locationText}`;
        notification.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#2196F3; color:white; padding:10px; border-radius:5px; z-index:9999; box-shadow:0 2px 5px rgba(0,0,0,0.2);';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } else {
        alert('Lokace zařízení nenalezena');
      }
    } catch (error) {
      console.error('Chyba při načítání lokace zařízení:', error);
      alert('Nepodařilo se načíst lokaci zařízení');
    }
  };

  // Funkce pro zpracování formuláře
  // Funkce pro přidání nového zákazníka
  const handleNewCustomer = async (customerData) => {
    try {
      const newCustomer = await createCustomer(customerData);
      setCustomers(prev => [...prev, newCustomer]);
      setShowCustomerModal(false);
      return newCustomer;
    } catch (error) {
      console.error('Chyba při vytváření zákazníka:', error);
      throw error;
    }
  };

  // Funkce pro přidání nového zařízení
  const handleNewEquipment = async (equipmentData) => {
    try {
      const newEquipment = await createEquipment(equipmentData);
      const updatedEquipment = await getEquipment();
      setEquipment(updatedEquipment);
      setShowEquipmentModal(false);
      return newEquipment;
    } catch (error) {
      console.error('Chyba při vytváření zařízení:', error);
      throw error;
    }
  };

  // Funkce pro načítání konfigurací při změně zařízení
  const handleEquipmentChange = async (equipmentId, setFieldValue) => {
    if (equipmentId) {
      try {
        const configs = await getConfigurationsForEquipment(equipmentId);
        setConfigurations(configs);
        // Resetuj configuration_id při změně zařízení
        setFieldValue('configuration_id', '');
        
        // Najdi vybrané zařízení a propish kategorie a třídu
        const selectedEquipment = equipment.find(eq => eq.id === parseInt(equipmentId));
        if (selectedEquipment) {
          setFieldValue('category', selectedEquipment.category || '');
          setFieldValue('equipment_class', selectedEquipment.equipment_class || '');
          setFieldValue('equipment_type', selectedEquipment.equipment_type || '');
          setFieldValue('model', selectedEquipment.model || '');
        }
      } catch (error) {
        console.error('Chyba při načítání konfigurací:', error);
        setConfigurations([]);
      }
    } else {
      setConfigurations([]);
      setFieldValue('configuration_id', '');
      setFieldValue('category', '');
      setFieldValue('equipment_class', '');
      setFieldValue('equipment_type', '');
      setFieldValue('model', '');
    }
  };

  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {
      // Podrobné logování aktuálních hodnot
      console.log('==== ODESÍLÁM REVIZI: DETAIL HODNOT ====');
      console.log('Celý objekt values:', JSON.stringify(values, null, 2));
      console.log('Typ equipment_id:', typeof values.equipment_id);
      if (typeof values.equipment_id === 'string' && values.equipment_id !== '') {
        values.equipment_id = parseInt(values.equipment_id, 10);
        console.log('Konvertuji equipment_id na číslo:', values.equipment_id);
      }
      
      // Check required fields
      const requiredFields = ['equipment_id', 'technician_name', 'revision_date', 'evaluation', 'location'];
      const missingFields = requiredFields.filter(field => !values[field]);
      if (missingFields.length > 0) {
        console.error('Chybí povinná pole:', missingFields);
        throw new Error(`Chybí povinná pole: ${missingFields.join(', ')}`);
      }

      // Připravíme data revize - vytvoříme kopii, abychom nemodifikovali originál
      const revisionData = { ...values };
      delete revisionData.defects;
      
      // Ensure all check fields are properly formatted as objects
      const checkFields = ['documentation_check', 'equipment_check', 'functional_test', 'load_test'];
      checkFields.forEach(field => {
        if (typeof revisionData[field] !== 'object' || revisionData[field] === null) {
          console.warn(`Field ${field} is not a valid object, setting default`);
          if (field === 'documentation_check') revisionData[field] = createDefaultChecks(documentationItems, 'documentation');
          if (field === 'equipment_check') revisionData[field] = createDefaultChecks(equipmentItems, 'equipment');
          if (field === 'functional_test') revisionData[field] = createDefaultChecks(functionalItems, 'equipment');
          if (field === 'load_test') revisionData[field] = createDefaultChecks(loadItems, 'equipment');
        }
      });

      // Ensure new fields are properly formatted
      if (!Array.isArray(revisionData.measuring_instruments)) {
        revisionData.measuring_instruments = baseDefaultValues.measuring_instruments;
      }
      if (typeof revisionData.technical_assessment !== 'object' || revisionData.technical_assessment === null) {
        revisionData.technical_assessment = baseDefaultValues.technical_assessment;
      }
      if (!Array.isArray(revisionData.dangers)) {
        revisionData.dangers = [];
      }
      
      // Make sure the equipment_id is a number
      if (typeof revisionData.equipment_id === 'string') {
        revisionData.equipment_id = parseInt(revisionData.equipment_id, 10);
      }
      
      console.log('Odesílám data revize:', revisionData);
      
      // Odešleme revizi a získáme odpověď s ID
      let revisionResponse;
      try {
        console.log('Odesílám revizi přímo přes API service...');
        
        // Použijeme přímo API service místo callback funkce
        if (initialValues?.id) {
          console.log(`Aktualizuji existující revizi s ID ${initialValues.id}`);
          revisionResponse = await updateRevision(initialValues.id, revisionData);
        } else {
          console.log('Vytvářím novou revizi');
          revisionResponse = await createRevision(revisionData);
        }
        
        console.log('Odpověď API service (kompletní):', revisionResponse);
        
        // Zkontrolujeme, zda revisionResponse může být falsy nebo neobsahuje id
        if (!revisionResponse) {
          console.error('Odpověď API je prázdná nebo undefined');
          throw new Error('Server nevrátil žádnou odpověď');
        }
      } catch (apiError) {
        console.error('API chyba:', apiError);
        console.error('API response details:', apiError.response?.data);
        throw new Error(`API chyba: ${apiError.message || 'Neznámá chyba'}`);
      }
      
      // Kontrola ID
      if (!revisionResponse.id) {
        console.error('Odpověď neobsahuje ID revize:', revisionResponse);
        throw new Error('Server nevrátil ID revize');
      }
      
      console.log('Revize uložena, ID:', revisionResponse.id);
      
      // Pokud máme závady, vytvoříme je a připojíme k revizi
      if (values.defects && values.defects.length > 0) {
        console.log(`Ukládám ${values.defects.length} závad:`, values.defects);
        
        for (const defect of values.defects) {
          if (!defect.description) {
            console.warn('Přeskakuji závadu bez popisu:', defect);
            continue;
          }
          
          try {
            const defectResponse = await createDefect({
              ...defect,
              revision_id: revisionResponse.id,
            });
            console.log('Závada uložena:', defectResponse);
          } catch (defectError) {
            console.error('Chyba při ukládání závady:', defectError);
            // Pokračujeme s dalšími závadami i když jedna selže
          }
        }
      }
      
      setSubmitting(false);
      
      // Na konec zavoláme původní onCancel, pokud byl definován
      // To zajistí, že se zavře modální okno
      if (typeof onCancel === 'function') {
        onCancel();
      }
    } catch (error) {
      console.error('Chyba při ukládání revize:', error);
      setSubmitting(false);
      alert(`Chyba při ukládání revize: ${error.message || 'Neznámá chyba'}`);
    }
  };

  if (loading || !defectsLoaded || !formInitValues) {
    return <div className="text-center py-4">Načítání...</div>;
  }

  // Pomocná funkce pro renderování radio buttonů
  const renderRadioGroup = (section, sectionName, items, itemsDict, values, setFieldValue) => (
    <div className="mt-4">
      <h3 className="font-semibold text-lg mb-2">{sectionName}</h3>
      <div className="grid gap-4">
        {Object.keys(items).map(key => {
          const currentValue = values[section][key];
          const isNegativeValue = currentValue === 'Nevyhovuje' || currentValue === 'Nepředložen';
          const itemName = itemsDict[key];
          
          // Najdeme existující závadu pro tuto položku
          const existingDefect = values.defects.find(
            d => d.section === section && d.item_key === key
          );
          
          return (
            <div key={key} className="border p-3 rounded-lg bg-white">
              <div className="font-medium mb-2">{itemName}</div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(section === 'documentation_check' ? checkResponses.documentation : checkResponses.equipment).map(value => (
                  <label key={value} className="flex items-center">
                    <input
                      type="radio"
                      name={`${section}.${key}`}
                      value={value}
                      checked={values[section][key] === value}
                      onChange={() => {
                        setFieldValue(`${section}.${key}`, value);
                        
                        // Pokud už není "Nevyhovuje"/"Nepředložen", odstraníme závadu, pokud existuje
                        if (value !== 'Nevyhovuje' && value !== 'Nepředložen' && existingDefect) {
                          setFieldValue(
                            'defects',
                            values.defects.filter(d => !(d.section === section && d.item_key === key))
                          );
                        }
                        
                        // Pokud je "Nevyhovuje"/"Nepředložen" a závada neexistuje, vytvoříme novou
                        if ((value === 'Nevyhovuje' || value === 'Nepředložen') && !existingDefect) {
                          setFieldValue('defects', [
                            ...values.defects,
                            {
                              section,
                              item_key: key,
                              item_name: itemName,
                              description: '',
                              severity: 'medium',
                            }
                          ]);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={
                      value === 'Vyhovuje' || value === 'Předložen'
                        ? 'text-green-700' 
                        : value === 'Nevyhovuje' || value === 'Nepředložen'
                          ? 'text-red-600' 
                          : value === 'Není součástí'
                            ? 'text-blue-600'
                            : 'text-gray-600'
                    }>
                      {value}
                    </span>
                  </label>
                ))}
              </div>
              
              {/* Zobrazit popis závady, pokud je položka "Nevyhovuje" nebo "Nepředložen" */}
              {isNegativeValue && (
                <div className="mt-3 p-3 border border-red-200 rounded-lg bg-red-50">
                  <label className="block font-medium text-sm text-red-700 mb-1">
                    Popis závady:
                  </label>
                  <textarea
                    value={existingDefect ? existingDefect.description : ''}
                    onChange={(e) => {
                      if (existingDefect) {
                        const updatedDefects = values.defects.map(d => 
                          d.section === section && d.item_key === key
                            ? { ...d, description: e.target.value }
                            : d
                        );
                        setFieldValue('defects', updatedDefects);
                      }
                    }}
                    className="w-full p-2 border rounded text-sm"
                    rows="2"
                    placeholder="Popište zjištěnou závadu..."
                  />
                  
                  <label className="block font-medium text-sm text-red-700 mt-2 mb-1">
                    Závažnost:
                  </label>
                  <select
                    value={existingDefect ? existingDefect.severity : 'medium'}
                    onChange={(e) => {
                      if (existingDefect) {
                        const updatedDefects = values.defects.map(d => 
                          d.section === section && d.item_key === key
                            ? { ...d, severity: e.target.value }
                            : d
                        );
                        setFieldValue('defects', updatedDefects);
                      }
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    {defectSeverityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div>
    <Formik
      initialValues={formInitValues}
      validationSchema={RevisionSchema}
      onSubmit={handleSubmitForm}
      enableReinitialize={true}
    >
      {({ isSubmitting, dirty, isValid, values, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Revizní zpráva vyhrazeného zdvihacího zařízení</h3>
            
            <div className="mb-3">
              <label htmlFor="procedure_type" className="block text-sm font-medium text-gray-700">Typ úkonu (dle § 8 NV 193/2022 Sb.)</label>
              <Field
                as="select"
                name="procedure_type"
                id="procedure_type"
                className="mt-1 block w-full rounded-md text-sm border-gray-300"
              >
                {procedureTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="procedure_type" component="div" className="mt-1 text-xs text-red-600" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label htmlFor="revision_number" className="block text-sm font-medium text-gray-700">Číslo revize</label>
                <Field
                  type="text"
                  name="revision_number"
                  id="revision_number"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  placeholder="RE000001"
                />
                <ErrorMessage name="revision_number" component="div" className="mt-1 text-xs text-red-600" />
              </div>

              {/* Skrytá pole pro kategorie a třídu */}
              <Field type="hidden" name="category" />
              <Field type="hidden" name="equipment_class" />
              <Field type="hidden" name="equipment_type" />
              <Field type="hidden" name="model" />
              
              <div>
                <label htmlFor="equipment_id" className="block text-sm font-medium text-gray-700">Zařízení</label>
                <div className="flex gap-2">
                  <Field
                    as="select"
                    name="equipment_id"
                    id="equipment_id"
                    className="mt-1 block w-full rounded-md text-sm border-gray-300"
                    onChange={(e) => {
                      setFieldValue('equipment_id', e.target.value);
                      handleEquipmentChange(e.target.value, setFieldValue);
                    }}
                  >
                    <option value="">-- Vyberte zařízení --</option>
                    {equipment.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.manufacturer} {item.model} - {item.company_name}
                        {item.category && item.equipment_class ? ` (§3${item.category}, ${item.equipment_class}. třída)` : ''}
                      </option>
                    ))}
                  </Field>
                  <button
                    type="button"
                    onClick={() => setShowEquipmentModal(true)}
                    className="mt-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 whitespace-nowrap"
                  >
                    + Nové zařízení
                  </button>
                </div>
                <ErrorMessage name="equipment_id" component="div" className="mt-1 text-xs text-red-600" />
              </div>

              <div>
                <label htmlFor="configuration_id" className="block text-sm font-medium text-gray-700">
                  Konfigurace zařízení
                </label>
                <Field
                  as="select"
                  name="configuration_id"
                  id="configuration_id"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  disabled={!values.equipment_id || configurations.length === 0}
                >
                  <option value="">-- Vyberte konfiguraci --</option>
                  {configurations.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.description || `Konfigurace ${config.id}`}
                      {config.min_reach && config.max_reach && 
                        ` (${config.min_reach}-${config.max_reach}m)`
                      }
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="configuration_id" component="div" className="mt-1 text-xs text-red-600" />
                {configurations.length === 0 && values.equipment_id && (
                  <div className="mt-1 text-xs text-gray-500">
                    Pro vybrané zařízení nejsou k dispozici žádné konfigurace
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Místo provedení revize</label>
                <div className="flex">
                  <Field
                    as="select"
                    name="location"
                    id="location"
                    className="mt-1 block w-full text-sm border-gray-300"
                  >
                    <option value="">-- Vyberte místo --</option>
                    <optgroup label="🏗️ Aktivní stavby">
                      {projects.filter(project => ['active', 'planned'].includes(project.status)).map(project => (
                        <option key={`project_${project.id}`} value={`${project.name}, ${project.location.address}`}>
                          {project.name} - {project.client} ({project.project_number})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="⏸️ Pozastavené stavby">
                      {projects.filter(project => project.status === 'on_hold').map(project => (
                        <option key={`onhold_${project.id}`} value={`${project.name}, ${project.location.address}`}>
                          {project.name} - {project.client} ({project.project_number})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="✅ Dokončené stavby">
                      {projects.filter(project => project.status === 'completed').map(project => (
                        <option key={`completed_${project.id}`} value={`${project.name}, ${project.location.address}`}>
                          {project.name} - {project.client} ({project.project_number})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="📍 Ostatní">
                      <option value="Hlavní sklad, Průmyslová 123, Praha 10">🏢 Hlavní sklad</option>
                      <option value="Servisní dílna, Řemeslnická 45, Praha 5">🔧 Servisní dílna</option>
                      <option value="custom">📍 Jiné místo (zadat ručně)</option>
                    </optgroup>
                  </Field>
                  <button
                    type="button"
                    onClick={() => handleGetLocation(setFieldValue)}
                    className="mt-1 px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="Získat aktuální GPS souřadnice"
                  >
                    📍
                  </button>
                </div>
                
                {/* Zobrazit textové pole pro vlastní lokaci pokud je vybrán 'custom' */}
                {values.location === 'custom' && (
                  <div className="mt-2">
                    <Field
                      type="text"
                      name="custom_location"
                      placeholder="Zadejte vlastní lokaci..."
                      className="mt-1 block w-full text-sm border-gray-300 rounded-md"
                      onChange={(e) => {
                        setFieldValue('custom_location', e.target.value);
                        // Pokud má custom_location hodnotu, použij ji jako location
                        if (e.target.value) {
                          setFieldValue('location', e.target.value);
                        }
                      }}
                    />
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-500">
                  Vyberte stavbu z databáze, sklad/dílnu nebo zadejte vlastní místo
                </div>
                <ErrorMessage name="location" component="div" className="mt-1 text-xs text-red-600" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label htmlFor="technician_name" className="block text-sm font-medium text-gray-700">Revizní technik</label>
                <Field
                  type="text"
                  name="technician_name"
                  id="technician_name"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                />
                <ErrorMessage name="technician_name" component="div" className="mt-1 text-xs text-red-600" />
              </div>

              <div>
                <label htmlFor="certification_number" className="block text-sm font-medium text-gray-700">Číslo osvědčení</label>
                <Field
                  type="text"
                  name="certification_number"
                  id="certification_number"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                />
                <ErrorMessage name="certification_number" component="div" className="mt-1 text-xs text-red-600" />
              </div>
            </div>

            {/* § 9 písm. e) - Časové údaje */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">§ 9 písm. e) - Časové údaje</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <DateInput 
                    name="test_start_date"
                    label="Datum zahájení zkoušky"
                    className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  />
                </div>
                <div>
                  <DateInput 
                    name="test_end_date"
                    label="Datum ukončení zkoušky"
                    className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  />
                </div>
                <div>
                  <DateInput 
                    name="report_date"
                    label="Datum vypracování revizní zprávy"
                    className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  />
                </div>
                <div>
                  <DateInput 
                    name="handover_date"
                    label="Datum předání revizní zprávy"
                    className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
              <div>
                <DateInput 
                  name="revision_date"
                  label="Datum revize (základní)"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                />
              </div>

              <div>
                <DateInput 
                  name="next_revision_date"
                  label="Doba platnosti (příští zkouška)"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                />
              </div>

              <div>
                <DateInput 
                  name="next_inspection_date"
                  label="Termín příští inspekce"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Rozsah revize a zjištěné závady</h3>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-md mb-2">§ 9 písm. g) - Seznam podkladů použitých k provedení zkoušky</h4>
              <p className="text-sm text-gray-600 mb-3">Předložené podklady</p>
              {renderRadioGroup('documentation_check', '', documentationItems, documentationItems, values, setFieldValue)}
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-md mb-2">§ 9 písm. h) - B. Vizuální prohlídka dle ČSN 27 0142/2023</h4>
              <p className="text-sm text-gray-600 mb-3">Kontrola technického stavu</p>
              {renderRadioGroup('equipment_check', '', equipmentItems, equipmentItems, values, setFieldValue)}
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-md mb-2">§ 9 písm. h) - C. Funkční zkouška dle ČSN 27 0142/2023</h4>
              <p className="text-sm text-gray-600 mb-3">Zkoušky funkcí a bezpečnostních prvků</p>
              {renderRadioGroup('functional_test', '', functionalItems, functionalItems, values, setFieldValue)}
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-md mb-2">§ 9 písm. h) - D. Zkoušky se zatížením dle ČSN 27 0142/2023</h4>
              <p className="text-sm text-gray-600 mb-3">Zkoušky nosnosti a stability</p>
              {renderRadioGroup('load_test', '', loadItems, loadItems, values, setFieldValue)}
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg mb-3">
              <h4 className="font-medium text-md mb-2">E. Soupis použitých měřicích přístrojů</h4>
              <p className="text-sm text-gray-600 mb-3">§ 9 písm. f) - Soupis použitých měřicích přístrojů</p>
              
              <div className="space-y-3">
                {values.measuring_instruments && values.measuring_instruments.map((instrument, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded border">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Měřicí přístroj</label>
                      <Field
                        type="text"
                        name={`measuring_instruments.${index}.name`}
                        className="mt-1 block w-full text-sm border border-gray-300 rounded-md p-1"
                        placeholder="Název přístroje"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Rozsah</label>
                      <Field
                        type="text"
                        name={`measuring_instruments.${index}.range`}
                        className="mt-1 block w-full text-sm border border-gray-300 rounded-md p-1"
                        placeholder="Rozsah měření"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Účel použití</label>
                      <Field
                        type="text"
                        name={`measuring_instruments.${index}.purpose`}
                        className="mt-1 block w-full text-sm border border-gray-300 rounded-md p-1"
                        placeholder="Účel použití"
                      />
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const newInstrument = { name: '', range: '', purpose: '' };
                    setFieldValue('measuring_instruments', [...values.measuring_instruments, newInstrument]);
                  }}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  + Přidat měřicí přístroj
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">§ 9 písm. k) - Slovní zhodnocení technického stavu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nosná konstrukce</label>
                <Field
                  as="textarea"
                  name="technical_assessment.structure"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Bez viditelných poškození, koroze nebo deformací"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bezpečnostní prvky</label>
                <Field
                  as="textarea"
                  name="technical_assessment.safety"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Všechny funkční, správně seřízené"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mechanismy</label>
                <Field
                  as="textarea"
                  name="technical_assessment.mechanisms"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Plynulý chod, účinné brzdění"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Elektrické zařízení</label>
                <Field
                  as="textarea"
                  name="technical_assessment.electrical"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Bez závad, správná funkce"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ochranná zařízení</label>
                <Field
                  as="textarea"
                  name="technical_assessment.protection"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Funkční, odpovídají požadavkům"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dokumentace</label>
                <Field
                  as="textarea"
                  name="technical_assessment.documentation"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  rows="2"
                  placeholder="Kompletní, aktuální"
                />
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-md mb-2">§ 9 písm. l) - Vyhodnocení předchozích kontrol</h4>
              <div className="mb-3">
                <label className="flex items-center">
                  <Field
                    type="checkbox"
                    name="previous_controls_ok"
                    className="mr-2"
                  />
                  Všechny závady zjištěné při předchozí revizi byly řádně odstraněny
                </label>
              </div>
              <div>
                <label htmlFor="technical_trend" className="block text-sm font-medium text-gray-700">Trend technického stavu</label>
                <Field
                  type="text"
                  name="technical_trend"
                  id="technical_trend"
                  className="mt-1 block w-full rounded-md text-sm border-gray-300"
                  placeholder="Stabilní, bez zhoršujících se parametrů"
                />
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-md mb-2">§ 9 písm. j) - Soupis zjištěných nebezpečí</h4>
              <div className="space-y-3">
                {values.dangers && values.dangers.map((danger, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-red-50 p-3 rounded border border-red-200">
                    <div>
                      <label className="block text-xs font-medium text-red-700">Popis nebezpečí</label>
                      <Field
                        as="textarea"
                        name={`dangers.${index}.description`}
                        className="mt-1 block w-full text-sm border border-red-300 rounded-md p-1"
                        rows="2"
                        placeholder="Popište zjištěné nebezpečí..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-red-700">Úroveň rizika</label>
                      <Field
                        as="select"
                        name={`dangers.${index}.risk_level`}
                        className="mt-1 block w-full text-sm border border-red-300 rounded-md p-1"
                      >
                        <option value="low">Nízké</option>
                        <option value="medium">Střední</option>
                        <option value="high">Vysoké</option>
                      </Field>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedDangers = values.dangers.filter((_, i) => i !== index);
                          setFieldValue('dangers', updatedDangers);
                        }}
                        className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Odebrat
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    const newDanger = { description: '', risk_level: 'medium' };
                    setFieldValue('dangers', [...(values.dangers || []), newDanger]);
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  + Přidat nebezpečí
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">§ 9 písm. k) - Slovní zhodnocení technického stavu</h3>
            
            <div className="mb-3">
              <label htmlFor="evaluation" className="block text-sm font-medium text-gray-700">Celkové hodnocení</label>
              <Field
                as="select"
                name="evaluation"
                id="evaluation"
                className="mt-1 block w-full rounded-md text-sm border-gray-300"
              >
                {evalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="evaluation" component="div" className="mt-1 text-xs text-red-600" />
            </div>
            
            <div>
              <label htmlFor="conclusion" className="block text-sm font-medium text-gray-700">Dodatečné poznámky</label>
              <Field
                as="textarea"
                name="conclusion"
                id="conclusion"
                rows="4"
                className="mt-1 block w-full rounded-md text-sm border-gray-300"
                placeholder="Volitelné dodatečné poznámky k revizní zprávě..."
              />
              <ErrorMessage name="conclusion" component="div" className="mt-1 text-xs text-red-600" />
            </div>
            
            {/* Podpis technika */}
            <div className="mt-6 border-t pt-4">
              <label htmlFor="signature" className="block text-sm font-medium text-gray-700">Podpis technika</label>
              <div className="mt-1 p-8 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 min-h-[120px]">
                <p className="text-center text-gray-500 text-sm">Místo pro podpis technika</p>
              </div>
            </div>
            
            {/* Souhrn závad */}
            {values.defects && values.defects.length > 0 && (
              <div className="mt-4 bg-red-50 p-3 rounded-lg border border-red-200">
                <h3 className="font-semibold text-red-700 mb-2">Souhrn zjištěných závad ({values.defects.length})</h3>
                <ul className="space-y-2">
                  {values.defects.map((defect, index) => (
                    <li key={index} className="border-b pb-2">
                      <p className="font-medium">{defect.item_name}</p>
                      <p className="text-sm">{defect.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Závažnost: {
                          defect.severity === 'low' ? 'Nízká' : 
                          defect.severity === 'medium' ? 'Střední' : 'Vysoká'
                        }
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              {initialValues?.id ? 'Uložit změny' : 'Vytvořit revizi'}
            </button>
          </div>
        </Form>
      )}
    </Formik>

    {/* Modal pro přidání nového zařízení */}
    {showEquipmentModal && (
      <EquipmentModal
        customers={customers}
        onSubmit={handleNewEquipment}
        onCancel={() => setShowEquipmentModal(false)}
        onNewCustomer={() => setShowCustomerModal(true)}
      />
    )}

    {/* Modal pro přidání nového zákazníka */}
    {showCustomerModal && (
      <CustomerModal
        onSubmit={handleNewCustomer}
        onCancel={() => setShowCustomerModal(false)}
      />
    )}
  </div>
  );
};

export default RevisionForm;