/**
 * Generátor PDF protokolů revizí pomocí jsPDF
 * Poskytuje lepší podporu pro stránkování
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

// Registrace helperů pro Handlebars (kopie z původního generátoru)
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
  // Pokud je použit jako jednoduchý helper
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
 * Vygeneruje PDF protokol o revizi pomocí Puppeteer s vlastním stránkováním
 * @param {Object} revision - Data revize
 * @param {Object} equipment - Data zařízení
 * @param {Object} customer - Data zákazníka
 * @param {Object} configuration - Data konfigurace zařízení
 * @param {Stream} outputStream - Stream, do kterého se zapíše výsledné PDF
 */
const generateRevisionPdf = async (revision, equipment, customer, configuration, outputStream) => {
  try {
    console.log('Generování PDF s Puppeteer a vlastním stránkováním...');
    
    // Příprava dat pro šablonu (stejné jako v původním generátoru)
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
    
    // Nastavení obsahu stránky pro print media (aby fungovala @page pravidla)
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generování PDF bez header/footer - použijeme pouze CSS
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      }
    });
    
    // Zápis do streamu
    outputStream.write(pdfBuffer);
    outputStream.end();
    
    // Uzavření prohlížeče
    await browser.close();
    
    console.log('PDF úspěšně vygenerováno s vlastním stránkováním - BEZ ČÍSLOVÁNÍ!');
    
  } catch (error) {
    console.error('Chyba při generování PDF:', error);
    throw error;
  }
};

// Pomocné funkce (kopie z původního generátoru)
function prepareCheckItems(checkData, checkType) {
  if (!checkData || typeof checkData !== 'object') return [];
  
  const labels = {
    documentation_check: {
      pruvodka_jerabu: 'Průvodní dokumentace jeřábu',
      denik_zz: 'Provozní deník zdvihacího zařízení',
      sbp: 'Systém bezpečné práce (SBP)',
      // ... další mapování
    },
    equipment_check: {
      navod_dostupnost: 'Dostupnost návodu k obsluze',
      zapisy_denik: 'Zápisy v provozním deníku',
      udrzba_mazani: 'Údržba a mazání',
      // ... další mapování  
    },
    functional_test: {
      ovladaci_zarizeni: 'Ovládací zařízení',
      zabezpecovaci_zarizeni: 'Zabezpečovací zařízení',
      technologicka_zarizeni: 'Technologická zařízení',
      // ... další mapování
    }
  };
  
  const typeLabels = labels[checkType] || {};
  
  return Object.entries(checkData).map(([key, value]) => {
    const label = typeLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let resultValue = '';
    let valueClass = '';
    
    if (typeof value === 'boolean') {
      resultValue = value ? 'Vyhovuje' : 'Nevyhovuje';
      valueClass = value ? 'success' : 'error';
    } else {
      resultValue = value || '-';
      
      if (resultValue.toLowerCase().includes('vyhovuje') || 
          resultValue.toLowerCase().includes('předložen')) {
        valueClass = 'success';
      } else if (resultValue.toLowerCase().includes('nevyhovuje') || 
                 resultValue.toLowerCase().includes('nepředložen')) {
        valueClass = 'error';
      }
    }
    
    return { 
      label, 
      value: resultValue,
      value_class: valueClass
    };
  });
}

function prepareLoadTestItems(loadTestData) {
  if (!loadTestData) return [];
  
  return Object.entries(loadTestData).map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
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
      
      if (resultValue.toLowerCase().includes('vyhovuje')) {
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

module.exports = { generateRevisionPdf };