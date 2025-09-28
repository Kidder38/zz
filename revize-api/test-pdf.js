/**
 * Testovací skript pro ověření generování PDF s českými znaky
 */
const fs = require('fs');
const { generateRevisionPdf } = require('./utils/pdfMakeGenerator');

// Testovací data pro revizi
const testRevision = {
  revision_date: new Date(),
  start_date: new Date(),
  next_revision_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // za rok
  next_inspection_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // za 3 měsíce
  technician_name: 'František Novák',
  certification_number: 'CERT-123/2023',
  evaluation: 'VYHOVUJE', 
  location: 'Praha',
  documentation_check: {
    'návod_k_použití': true,
    'technická_dokumentace': true,
    'servisní_kniha': false
  },
  equipment_check: {
    'konstrukce_zařízení': true,
    'elektrická_instalace': true,
    'bezpečnostní_prvky': true
  },
  functional_test: {
    'pohyb_zdvihu': true,
    'brzdný_systém': true,
    'ovládací_prvky': true
  },
  load_test: {
    'statická_zkouška': { load: '110% zatížení', result: 'Vyhovuje' },
    'dynamická_zkouška': { load: '100% zatížení', result: 'Vyhovuje' }
  },
  conclusion: 'Zařízení je v dobrém technickém stavu a plně vyhovuje bezpečnostnímu provozu.',
  defects: [
    'Mírné opotřebení ložisek - sledovat při příští revizi',
    'Doporučena výměna oleje v převodovce do 6 měsíců'
  ]
};

// Testovací data pro zařízení
const testEquipment = {
  equipment_type: 'Mostový jeřáb',
  model: 'MJ-5000',
  manufacturer: 'Jeřáby s.r.o.',
  serial_number: 'SN-123456',
  year_of_manufacture: '2018',
  inventory_number: 'INV-789',
  min_reach: '2',
  max_reach: '10',
  max_load: '5000',
  location: 'Hala 3'
};

// Testovací data pro zákazníka
const testCustomer = {
  company_name: 'Výroba & Montáže a.s.',
  street: 'Průmyslová 1234/56',
  city: 'Žďár nad Sázavou',
  postal_code: '591 01',
  contact_person: 'Ing. Jiří Mráček',
  ico: '12345678',
  dic: 'CZ12345678'
};

console.log('Generuji testovací PDF...');

// Vytvoření výstupního streamu
const outputStream = fs.createWriteStream('./test-output.pdf');

// Po ukončení generování zobrazíme info
outputStream.on('finish', () => {
  console.log('PDF bylo úspěšně vygenerováno do souboru test-output.pdf');
});

// Při chybě zobrazíme chybovou zprávu
outputStream.on('error', (err) => {
  console.error('Chyba při zápisu PDF:', err);
});

// Generování PDF
try {
  generateRevisionPdf(testRevision, testEquipment, testCustomer, outputStream);
} catch (error) {
  console.error('Chyba při generování PDF:', error);
}