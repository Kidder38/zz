const axios = require('axios');

// Test equipment controller first since revisions depend on equipment
async function testEquipmentAPI() {
  try {
    console.log('Testing equipment API...');
    const response = await axios.get('http://localhost:3001/api/equipment');
    console.log('Equipment response status:', response.status);
    console.log('Equipment data count:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('First equipment item:', response.data[0]);
      return response.data[0].id; // Return the first equipment ID for revision test
    } else {
      console.log('No equipment found');
      return null;
    }
  } catch (error) {
    console.error('Error testing equipment API:', error.message);
    return null;
  }
}

// Test creating a revision
async function testCreateRevision(equipmentId) {
  if (!equipmentId) {
    console.log('Cannot test revisions without equipment ID');
    return;
  }
  
  try {
    console.log(`Testing revision creation for equipment ID ${equipmentId}...`);
    
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);
    
    const twoYears = new Date();
    twoYears.setFullYear(today.getFullYear() + 2);
    
    const revisionData = {
      equipment_id: equipmentId,
      technician_name: 'Test Technician',
      certification_number: 'TEST-001',
      revision_date: today.toISOString().split('T')[0],
      start_date: today.toISOString().split('T')[0],
      evaluation: 'Vyhovuje bezpečnému provozu.',
      next_revision_date: twoYears.toISOString().split('T')[0],
      next_inspection_date: nextYear.toISOString().split('T')[0],
      documentation_check: { vychozi_revize_el: 'Předložen' },
      equipment_check: { navod_dostupnost: 'Vyhovuje' },
      functional_test: { ovladaci_zarizeni: 'Vyhovuje' },
      load_test: { dynamicka_zkouska: 'Vyhovuje' },
      conclusion: 'Test conclusion',
      location: 'Test location',
      revision_number: `RE${Date.now().toString().slice(-6)}`
    };
    
    console.log('Sending revision data:', JSON.stringify(revisionData, null, 2));
    
    const response = await axios.post('http://localhost:3001/api/revisions', revisionData);
    
    console.log('Revision creation response status:', response.status);
    console.log('Revision creation response data:', response.data);
    
    if (response.data && response.data.id) {
      console.log('TEST PASSED: Revision created successfully with ID:', response.data.id);
      return response.data.id;
    } else {
      console.log('TEST FAILED: Revision created but no ID returned');
      console.log('Response data:', response.data);
      return null;
    }
  } catch (error) {
    console.error('TEST FAILED: Error creating revision:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Run tests
async function runTests() {
  const equipmentId = await testEquipmentAPI();
  if (equipmentId) {
    const revisionId = await testCreateRevision(equipmentId);
  }
}

runTests();