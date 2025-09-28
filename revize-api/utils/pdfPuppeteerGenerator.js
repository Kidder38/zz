/**
 * Generátor PDF protokolů revizí pomocí Puppeteer a HTML šablony
 * Poskytuje plnou podporu pro české znaky bez problémů s kódováním
 */
const puppeteer = require('puppeteer-core');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { findChrome } = require('./chromeDetector');

// Načtení HTML šablony
const templatePath = path.join(__dirname, 'templates', 'revisionTemplate.html');
const templateSource = fs.readFileSync(templatePath, 'utf8');
const template = Handlebars.compile(templateSource);

// Registrace helperů pro Handlebars
Handlebars.registerHelper('if', function(condition, options) {
  if (condition) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('each', function(context, options) {
  let ret = "";
  
  if (context && context.length > 0) {
    for (let i = 0; i < context.length; i++) {
      ret = ret + options.fn(context[i]);
    }
  } else {
    ret = options.inverse(this);
  }
  
  return ret;
});

Handlebars.registerHelper('eq', function(a, b, options) {
  // Pokud je použit jako blokový helper
  if (typeof options === 'object' && options.fn) {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse ? options.inverse(this) : '';
    }
  }
  // Pokud je použit jako jednoduchý helper (pouze tři parametry)
  if (arguments.length === 3) {
    return a === b;
  }
  // Fallback
  return a === b;
});

Handlebars.registerHelper('gte', function(a, b) {
  return a >= b;
});

Handlebars.registerHelper('multiply', function(a, b) {
  return a * b;
});

// Helper pro formátování datumů
Handlebars.registerHelper('formatDate', function(dateString) {
  return formatDate(dateString);
});

/**
 * Formátuje datum do českého formátu
 * @param {string} dateString - ISO datum
 * @returns {string} - Formátované datum
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

/**
 * Mapování klíčů položek na jejich zobrazované názvy dle NV 193/2022 Sb.
 */
const documentationLabels = {
  // Základní dokumentace dle § 2e, f, g nařízení vlády č. 378/2001 Sb.
  pruvodka_jerabu: 'Průvodní dokumentace jeřábu',
  denik_zz: 'Provozní deník zdvihacího zařízení',
  sbp: 'Systém bezpečné práce (SBP)',
  dokumentace_strojni_el: 'Výkresová dokumentace strojní a elektrické části',
  
  // Revizní dokumentace
  vychozi_revize_el: 'Zápis o výchozí revizi elektrického zařízení',
  posledni_revize_el: 'Zápis o poslední revizi elektrického zařízení',
  posledni_revize_jer: 'Zápis o poslední provedené revizi zdvihacího zařízení',
  posledni_inspekce: 'Zápis o poslední provedené inspekci',
  
  // Návody a dokumentace
  navod_obsluha: 'Návod na obsluhu zdvihacího zařízení',
  
  // Konstrukce a základ
  prohlidky_ocel_konstrukce: 'Zápisy o prohlídkách nosných konstrukcí dle ČSN 73 2604',
  kotveni: 'Technická dokumentace základu nebo kotvení zdvihacího zařízení',
  
  // Speciální dokumentace (často nepředložené)
  jerabova_draha: 'Dokumentace dočasné jeřábové dráhy dle ČSN 27 2435',
  uzemneni: 'Zpráva o revizi přívodu dle ČSN 33 1500, ČSN 33 2000-6'
};

const equipmentLabels = {
  // Vizuální prohlídka dle ČSN 27 0142/2023
  navod_dostupnost: 'Dostupnost návodu výrobce',
  zapisy_denik: 'Provádění zápisů v deníku',
  udrzba_mazani: 'Údržba a mazání',
  pristupy_stanoviste: 'Přístupy a stanoviště obsluhy',
  nosna_konstrukce: 'Nosná konstrukce (svary, spoje, koroze)',
  nosne_organy: 'Nosné orgány, háky, kladnice',
  kabina: 'Kabina (vytápění, ventilace, osvětlení)',
  hasici_pristroj: 'Hasící přístroj',
  oznaceni: 'Označení a výstražná zařízení',
  ukazatel_vylozeni: 'Ukazatel vyložení',
  anemometr: 'Anemometr (pro venkovní jeřáby)',
  komunikace: 'Komunikační systémy'
};

const functionalLabels = {
  // Funkční zkouška dle ČSN 27 0142/2023
  ovladaci_zarizeni: 'Ovládací zařízení',
  zabezpecovaci_zarizeni: 'Zabezpečovací zařízení',
  technologicka_zarizeni: 'Technologická zařízení',
  funkce_stop: 'Funkce STOP',
  pohybove_mechanismy: 'Pohybové mechanismy a brzdy',
  omezovace: 'Omezovací a indikační zařízení',
  dalkove_ovladani: 'Dálkové ovládání'
};

const loadLabels = {
  // Zkoušky se zatížením dle ČSN 27 0142/2023
  dynamicka_zkouska: 'Dynamická zkouška (1,1x nosnost)',
  omezovac_nosnosti: 'Zkouška omezovače nosnosti (115%)',
  zkouska_stability: 'Zkouška stability'
};

/**
 * Transformuje data z kontroly na formát vhodný pro šablonu
 * @param {Object} checkData - Data z kontroly
 * @param {string} section - Sekce kontroly (documentation, equipment, functional, load)
 * @returns {Array} - Pole objektů pro šablonu
 */
function prepareCheckItems(checkData, section = '') {
  if (!checkData) return [];
  
  let labelMap = {};
  
  // Výběr správné mapovací tabulky podle sekce
  if (section === 'documentation_check') {
    labelMap = documentationLabels;
  } else if (section === 'equipment_check') {
    labelMap = equipmentLabels;
  } else if (section === 'functional_test') {
    labelMap = functionalLabels;
  } else if (section === 'load_test') {
    labelMap = loadLabels;
  }
  
  return Object.entries(checkData).map(([key, value]) => {
    // Použití mapování názvů, pokud existuje, jinak formátování klíče
    let label;
    if (labelMap[key]) {
      label = labelMap[key];
    } else {
      label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Formátování hodnoty
    let displayValue = '-';
    let valueClass = '';
    
    if (typeof value === 'boolean') {
      displayValue = value ? 'Vyhovuje' : 'Nevyhovuje';
      valueClass = value ? 'success' : 'error';
    } else if (value !== null && value !== undefined) {
      displayValue = value.toString();
      
      if (displayValue.toLowerCase().includes('vyhovuje') && 
          !displayValue.toLowerCase().includes('nevyhovuje')) {
        valueClass = 'success';
      } else if (displayValue.toLowerCase().includes('nevyhovuje')) {
        valueClass = 'error';
      }
    }
    
    return { 
      label, 
      value: displayValue,
      value_class: valueClass
    };
  });
}

/**
 * Transformuje data zátěžových testů na formát vhodný pro šablonu
 * @param {Object} loadTestData - Data ze zátěžových testů
 * @returns {Array} - Pole objektů pro šablonu
 */
function prepareLoadTestItems(loadTestData) {
  if (!loadTestData) return [];
  
  return Object.entries(loadTestData).map(([key, value]) => {
    // Použití mapování názvů, pokud existuje, jinak formátování klíče
    let label;
    if (loadLabels[key]) {
      label = loadLabels[key];
    } else {
      label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Formátování hodnoty
    let loadValue = '';
    let resultValue = '';
    let valueClass = '';
    
    if (typeof value === 'object' && value !== null) {
      loadValue = value.load || '';
      resultValue = value.result || (value.pass ? 'Vyhovuje' : 'Nevyhovuje');
      valueClass = value.pass || resultValue.toLowerCase().includes('vyhovuje') ? 'success' : 'error';
    } else if (typeof value === 'boolean') {
      resultValue = value ? 'Vyhovuje' : 'Nevyhovuje';
      valueClass = value ? 'success' : 'error';
    } else {
      resultValue = value !== null ? value.toString() : '-';
      
      if (resultValue.toLowerCase().includes('vyhovuje') && 
          !resultValue.toLowerCase().includes('nevyhovuje')) {
        valueClass = 'success';
      } else if (resultValue.toLowerCase().includes('nevyhovuje')) {
        valueClass = 'error';
      }
    }
    
    return { 
      label, 
      load: loadValue,
      value: resultValue,
      value_class: valueClass
    };
  });
}

/**
 * Vygeneruje PDF protokol o revizi
 * @param {Object} revision - Data revize
 * @param {Object} equipment - Data zařízení
 * @param {Object} customer - Data zákazníka
 * @param {Object} configuration - Data konfigurace zařízení
 * @param {Stream} outputStream - Stream, do kterého se zapíše výsledné PDF
 */
const generateRevisionPdf = async (revision, equipment, customer, configuration, outputStream) => {
  try {
    console.log('Generování PDF s Puppeteer - OPRAVENO!');
    
    // Příprava dat pro šablonu
    const data = {
      revision: {
        ...revision,
        revision_date: formatDate(revision.revision_date),
        start_date: formatDate(revision.start_date),
        next_revision_date: formatDate(revision.next_revision_date),
        next_inspection_date: formatDate(revision.next_inspection_date)
      },
      equipment,
      customer,
      configuration,
      documentation_check_items: revision.documentation_check ? 
        prepareCheckItems(typeof revision.documentation_check === 'string' ? 
          JSON.parse(revision.documentation_check) : revision.documentation_check, 'documentation_check') : [],
      equipment_check_items: revision.equipment_check ? 
        prepareCheckItems(typeof revision.equipment_check === 'string' ? 
          JSON.parse(revision.equipment_check) : revision.equipment_check, 'equipment_check') : [],
      functional_test_items: revision.functional_test ? 
        prepareCheckItems(typeof revision.functional_test === 'string' ? 
          JSON.parse(revision.functional_test) : revision.functional_test, 'functional_test') : [],
      load_test_items: revision.load_test ? 
        prepareLoadTestItems(typeof revision.load_test === 'string' ? 
          JSON.parse(revision.load_test) : revision.load_test) : [],
      defects: revision.defects || [],
      dangers: revision.dangers || [],
      measuring_instruments: revision.measuring_instruments || [],
      technical_assessment: revision.technical_assessment || {},
      previous_controls_ok: revision.previous_controls_ok !== false,
      technical_trend: revision.technical_trend || null,
      procedure_type: revision.procedure_type || 'ZKOUŠKA',
      vyhovuje: revision.evaluation?.toLowerCase().includes('vyhovuje') && 
                !revision.evaluation?.toLowerCase().includes('nevyhovuje')
    };
    
    // Vyrenderování HTML šablony
    const html = template(data);
    
    // Detekce Chrome
    const chromePath = await findChrome();
    console.log(`Nalezená cesta k Chrome: ${chromePath}`);
    
    // Spuštění Puppeteer
    const browser = await puppeteer.launch({
      executablePath: chromePath,
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Nastavení obsahu stránky a vypnutí Chrome default číslování
    await page.emulateMediaType('screen');
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generování PDF BEZ číslování stránek pro test
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '1.5cm',
        right: '1.5cm', 
        bottom: '1.5cm',
        left: '1.5cm'
      }
    });
    
    // Zápis do streamu
    outputStream.write(pdfBuffer);
    outputStream.end();
    
    // Uzavření prohlížeče
    await browser.close();
    
    console.log('PDF úspěšně vygenerováno.');
    
  } catch (error) {
    console.error('Chyba při generování PDF:', error);
    throw error;
  }
};

module.exports = { generateRevisionPdf };