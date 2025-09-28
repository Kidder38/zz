import React, { useState, useEffect } from 'react';
import { createCraneRecord } from '../../services/craneRecordsService';
import { createServiceRequestFromDefect } from '../../services/serviceService';
import { useAuth } from '../../auth/AuthContext';
import RevisionIntegration from './RevisionIntegration';

// Checklisty podle periodicity kontrol (NV 193/2022)
const CONTROL_CHECKLISTS = {
  daily: {
    name: 'Denní kontrola před zahájením práce',
    description: 'Kontrola prováděná obsluhou před každým zahájením práce',
    sections: {
      visual_inspection: {
        name: 'Vizuální kontrola',
        items: [
          { id: 'cables', name: 'Stav lan a řetězů', critical: true },
          { id: 'hooks', name: 'Stav háků a závěsů', critical: true },
          { id: 'safety_devices', name: 'Bezpečnostní zařízení', critical: true },
          { id: 'structure', name: 'Nosná konstrukce (trhliny, deformace)', critical: true },
          { id: 'counterweight', name: 'Protizávaží', critical: false },
          { id: 'working_area', name: 'Pracovní prostor (překážky)', critical: true }
        ]
      },
      functional_check: {
        name: 'Funkční kontrola',
        items: [
          { id: 'brake_test', name: 'Zkouška brzd (bez břemene)', critical: true },
          { id: 'controls', name: 'Ovládací prvky', critical: true },
          { id: 'limit_switches', name: 'Koncové spínače', critical: true },
          { id: 'warning_signals', name: 'Výstražná signalizace', critical: true },
          { id: 'emergency_stop', name: 'Nouzové zastavení', critical: true }
        ]
      }
    }
  },
  weekly: {
    name: 'Týdenní kontrola',
    description: 'Rozšířená kontrola prováděná obsluhou',
    sections: {
      detailed_inspection: {
        name: 'Podrobná kontrola',
        items: [
          { id: 'cable_condition', name: 'Detailní kontrola lan (opotřebení, přetržení drátů)', critical: true },
          { id: 'drum_condition', name: 'Stav bubnů', critical: true },
          { id: 'brake_pads', name: 'Brzdové obložení', critical: true },
          { id: 'lubrication', name: 'Mazání pohyblivých částí', critical: false },
          { id: 'electrical_connections', name: 'Elektrické spoje', critical: true },
          { id: 'track_condition', name: 'Stav pojezdové dráhy', critical: true }
        ]
      },
      load_test: {
        name: 'Zatěžkávací zkouška (pokud předepsána)',
        items: [
          { id: 'test_load', name: 'Zkouška s 110% jmenovitého zatížení', critical: true },
          { id: 'brake_holding', name: 'Držení brzd pod zatížením', critical: true },
          { id: 'stability', name: 'Stabilita jeřábu', critical: true }
        ]
      }
    }
  },
  monthly: {
    name: 'Měsíční kontrola',
    description: 'Technická kontrola prováděná odborným technikem',
    sections: {
      technical_inspection: {
        name: 'Technická inspekce',
        items: [
          { id: 'structural_joints', name: 'Šroubové spoje konstrukce', critical: true },
          { id: 'welded_joints', name: 'Svarové spoje (vizuálně)', critical: true },
          { id: 'gear_condition', name: 'Stav převodovek', critical: true },
          { id: 'motor_condition', name: 'Stav motorů', critical: true },
          { id: 'electrical_installation', name: 'Elektrická instalace', critical: true },
          { id: 'safety_systems', name: 'Bezpečnostní systémy', critical: true }
        ]
      },
      measurements: {
        name: 'Měření a testy',
        items: [
          { id: 'brake_torque', name: 'Brzdný moment', critical: true },
          { id: 'insulation_resistance', name: 'Izolační odpor', critical: true },
          { id: 'grounding', name: 'Uzemnění', critical: true },
          { id: 'load_limiter', name: 'Omezovač zatížení', critical: true }
        ]
      }
    }
  },
  quarterly: {
    name: 'Čtvrtletní kontrola',
    description: 'Rozšířená kontrola prováděná odborným technikem každé 3 měsíce',
    sections: {
      comprehensive_inspection: {
        name: 'Komplexní kontrola',
        items: [
          { id: 'load_test_required', name: 'Zatěžkávací zkouška s plným zatížením', critical: true },
          { id: 'structural_analysis', name: 'Analýza nosné konstrukce', critical: true },
          { id: 'fatigue_assessment', name: 'Posouzení únavových jevů', critical: true },
          { id: 'safety_systems_test', name: 'Test všech bezpečnostních systémů', critical: true },
          { id: 'documentation_review', name: 'Revize dokumentace a záznamů', critical: false }
        ]
      },
      detailed_measurements: {
        name: 'Detailní měření',
        items: [
          { id: 'geometric_accuracy', name: 'Geometrická přesnost jeřábu', critical: true },
          { id: 'load_moment_indicator', name: 'Indikátor zatěžovacího momentu', critical: true },
          { id: 'noise_levels', name: 'Úroveň hluku', critical: false },
          { id: 'vibration_analysis', name: 'Analýza vibrací', critical: true }
        ]
      }
    }
  },
  semi_annual: {
    name: 'Půlroční kontrola',
    description: 'Důkladná kontrola prováděná odborným technikem každých 6 měsíců',
    sections: {
      extensive_inspection: {
        name: 'Rozsáhlá kontrola',
        items: [
          { id: 'ndt_testing', name: 'Nedestruktivní zkoušky (NDT)', critical: true },
          { id: 'wear_analysis', name: 'Analýza opotřebení komponent', critical: true },
          { id: 'lubrication_system', name: 'Mazací systém - kompletní kontrola', critical: true },
          { id: 'electrical_insulation', name: 'Izolační stav elektrických částí', critical: true },
          { id: 'control_system_calibration', name: 'Kalibrace řídicího systému', critical: true }
        ]
      },
      performance_testing: {
        name: 'Výkonnostní zkoušky',
        items: [
          { id: 'lifting_speed_test', name: 'Zkouška rychlosti zdvihání', critical: true },
          { id: 'positioning_accuracy', name: 'Přesnost polohování', critical: true },
          { id: 'overload_protection', name: 'Ochrana proti přetížení', critical: true },
          { id: 'emergency_systems', name: 'Nouzové systémy', critical: true }
        ]
      }
    }
  },
  annual: {
    name: 'Roční kontrola',
    description: 'Nejrozsáhlejší kontrola prováděná certifikovaným technikem ročně',
    sections: {
      comprehensive_evaluation: {
        name: 'Komplexní hodnocení',
        items: [
          { id: 'structural_integrity', name: 'Celistvost konstrukce (RTG, UT)', critical: true },
          { id: 'fatigue_life_assessment', name: 'Posouzení únavové životnosti', critical: true },
          { id: 'safety_coefficient', name: 'Bezpečnostní součinitele', critical: true },
          { id: 'regulatory_compliance', name: 'Soulad s aktuálními předpisy', critical: true },
          { id: 'modernization_needs', name: 'Potřeba modernizace', critical: false }
        ]
      },
      certification_review: {
        name: 'Certifikační přezkoumání',
        items: [
          { id: 'operating_manual_update', name: 'Aktualizace provozního manuálu', critical: false },
          { id: 'operator_training_check', name: 'Kontrola školení obsluhy', critical: true },
          { id: 'maintenance_history', name: 'Historie údržby a oprav', critical: false },
          { id: 'future_maintenance_plan', name: 'Plán budoucí údržby', critical: false }
        ]
      }
    }
  }
};

const ControlChecklistForm = ({ controlType, selectedEquipment, onSubmit, onCancel }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState({});
  const [defects, setDefects] = useState([]);
  const [formData, setFormData] = useState({
    weather_conditions: '',
    operating_hours: '',
    notes: '',
    operator_observations: ''
  });
  const [showRevisionIntegration, setShowRevisionIntegration] = useState(false);
  const [controlRecordId, setControlRecordId] = useState(null);

  const checklistTemplate = CONTROL_CHECKLISTS[controlType] || CONTROL_CHECKLISTS.daily;

  useEffect(() => {
    if (!checklistTemplate || !checklistTemplate.sections) {
      return;
    }
    
    // Inicializace checklistu
    const initialChecklist = {};
    Object.keys(checklistTemplate.sections).forEach(sectionKey => {
      initialChecklist[sectionKey] = {};
      checklistTemplate.sections[sectionKey].items.forEach(item => {
        initialChecklist[sectionKey][item.id] = {
          result: 'ok', // 'ok', 'defect', 'not_checked'
          notes: ''
        };
      });
    });
    setChecklist(initialChecklist);
  }, [controlType, checklistTemplate]);

  const handleChecklistChange = (sectionKey, itemId, field, value) => {
    setChecklist(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [itemId]: {
          ...prev[sectionKey]?.[itemId],
          [field]: value
        }
      }
    }));

    // Pokud je výsledek "defect", automaticky vytvoř návrh závady
    if (field === 'result' && value === 'defect') {
      const section = checklistTemplate.sections[sectionKey];
      const item = section.items.find(i => i.id === itemId);
      if (item && !defects.find(d => d.item_id === itemId)) {
        setDefects(prev => [...prev, {
          id: Date.now(),
          item_id: itemId,
          section: section.name,
          item_name: item.name,
          description: '',
          severity: item.critical ? 'high' : 'medium',
          requires_service: item.critical,
          notes: ''
        }]);
      }
    }

    // Pokud je výsledek "ok", odstraň závadu
    if (field === 'result' && value === 'ok') {
      setDefects(prev => prev.filter(d => d.item_id !== itemId));
    }
  };

  const handleDefectChange = (defectId, field, value) => {
    setDefects(prev => prev.map(defect => 
      defect.id === defectId 
        ? { ...defect, [field]: value }
        : defect
    ));
  };

  const removeDefect = (defectId) => {
    const defect = defects.find(d => d.id === defectId);
    if (defect) {
      // Vrať příslušnou položku checklistu na 'ok'
      Object.keys(checklist).forEach(sectionKey => {
        if (checklist[sectionKey][defect.item_id]) {
          handleChecklistChange(sectionKey, defect.item_id, 'result', 'ok');
        }
      });
    }
    setDefects(prev => prev.filter(d => d.id !== defectId));
  };

  const calculateOverallResult = () => {
    const criticalDefects = defects.filter(d => d.severity === 'high' || d.severity === 'critical');
    const mediumDefects = defects.filter(d => d.severity === 'medium');
    
    if (criticalDefects.length > 0) return 'failed';
    if (mediumDefects.length > 0) return 'passed_with_remarks';
    return 'passed';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const overallResult = calculateOverallResult();
      const criticalDefects = defects.filter(d => d.requires_service);

      // Vytvoř záznam kontroly
      const recordData = {
        equipment_id: selectedEquipment.id,
        record_category: 'control',
        record_type: controlType,
        control_period: controlType,
        title: checklistTemplate.name,
        description: checklistTemplate.description,
        status: 'completed',
        result: overallResult,
        severity: criticalDefects.length > 0 ? 'high' : defects.length > 0 ? 'medium' : 'info',
        operating_hours: formData.operating_hours ? parseFloat(formData.operating_hours) : null,
        weather_conditions: formData.weather_conditions,
        checklist_results: checklist,
        findings: defects.length > 0 ? 
          `Zjištěno ${defects.length} závad: ${defects.map(d => d.item_name).join(', ')}` :
          'Kontrola provedena bez závad',
        recommendations: criticalDefects.length > 0 ?
          'Nutná okamžitá náprava kritických závad před dalším použitím' :
          defects.length > 0 ? 'Doporučujeme nápravná opatření v nejbližší době' : null,
        maintenance_required: defects.some(d => d.requires_service)
      };

      const createdRecord = await createCraneRecord(recordData);
      setControlRecordId(createdRecord.id);

      // Vytvoř servisní požadavky pro kritické závady
      for (const defect of criticalDefects) {
        await createServiceRequestFromDefect({
          equipment_id: selectedEquipment.id,
          control_type: controlType,
          defects: [{
            item_name: defect.item_name,
            description: defect.description || `Zjištěna závada při ${checklistTemplate.name.toLowerCase()}`,
            severity: defect.severity,
            notes: defect.notes
          }],
          critical: defect.severity === 'high' || defect.severity === 'critical',
          record_id: createdRecord.id
        });
      }

      // Pokud jsou středně závažné nebo vysoké závady, nabídni revizi
      const needsRevision = defects.some(d => 
        d.severity === 'high' || d.severity === 'critical' || 
        (d.severity === 'medium' && defects.filter(def => def.severity === 'medium').length >= 3)
      );

      if (needsRevision) {
        setShowRevisionIntegration(true);
      } else {
        await onSubmit();
      }
    } catch (error) {
      console.error('Chyba při ukládání kontroly:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const handleRevisionComplete = async () => {
    setShowRevisionIntegration(false);
    await onSubmit();
  };

  const handleRevisionCancel = () => {
    setShowRevisionIntegration(false);
    // Kontrola už byla uložena, pouze ukončíme bez revize
    onSubmit();
  };

  // Pokud je aktivní integrace revize, zobraz ji
  if (showRevisionIntegration) {
    const revisionDefects = defects.filter(d => 
      d.severity === 'high' || d.severity === 'critical' || d.severity === 'medium'
    );

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900">Kontrola dokončena</h3>
          <p className="text-sm text-blue-700 mt-1">
            Byla zjištěna závažná zjištění. Doporučujeme provést revizi.
          </p>
        </div>
        
        <RevisionIntegration
          equipmentId={selectedEquipment.id}
          controlDefects={revisionDefects}
          onComplete={handleRevisionComplete}
          onCancel={handleRevisionCancel}
        />
      </div>
    );
  }

  // Ochrana před chybějícím checklistTemplate
  if (!checklistTemplate) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-red-900">Chyba načítání checklistu</h3>
        <p className="text-sm text-red-600 mt-1">
          Typ kontroly "{controlType}" nebyl nalezen v dostupných checklistech.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Dostupné typy: {Object.keys(CONTROL_CHECKLISTS).join(', ')}
        </p>
        <button
          onClick={onCancel}
          className="mt-3 bg-gray-200 px-3 py-1 text-sm rounded hover:bg-gray-300"
        >
          Zpět
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">{checklistTemplate.name}</h3>
        <p className="text-sm text-gray-600">{checklistTemplate.description}</p>
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Zařízení:</span> {selectedEquipment?.manufacturer} {selectedEquipment?.model}
        </div>
      </div>

      {/* Základní údaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Povětrnostní podmínky
          </label>
          <input
            type="text"
            value={formData.weather_conditions}
            onChange={(e) => setFormData(prev => ({ ...prev, weather_conditions: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Jasno, 15°C, bezvětří"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Motohodiny
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.operating_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, operating_hours: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1247.5"
          />
        </div>
      </div>

      {/* Kontrolní seznamy */}
      {Object.entries(checklistTemplate.sections).map(([sectionKey, section]) => (
        <div key={sectionKey} className="bg-white border rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">{section.name}</h4>
          <div className="space-y-3">
            {section.items.map((item) => {
              const itemResult = checklist[sectionKey]?.[item.id]?.result || 'ok';
              const itemNotes = checklist[sectionKey]?.[item.id]?.notes || '';
              
              return (
                <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                        {item.critical && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Kritické
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`${sectionKey}_${item.id}`}
                          value="ok"
                          checked={itemResult === 'ok'}
                          onChange={(e) => handleChecklistChange(sectionKey, item.id, 'result', e.target.value)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-green-700">✅ Vyhovuje</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`${sectionKey}_${item.id}`}
                          value="defect"
                          checked={itemResult === 'defect'}
                          onChange={(e) => handleChecklistChange(sectionKey, item.id, 'result', e.target.value)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-red-700">❌ Závada</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`${sectionKey}_${item.id}`}
                          value="not_checked"
                          checked={itemResult === 'not_checked'}
                          onChange={(e) => handleChecklistChange(sectionKey, item.id, 'result', e.target.value)}
                          className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">➖ Nekontrolováno</span>
                      </label>
                    </div>
                  </div>
                  {(itemResult === 'defect' || itemNotes) && (
                    <div className="mt-2">
                      <textarea
                        value={itemNotes}
                        onChange={(e) => handleChecklistChange(sectionKey, item.id, 'notes', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                        rows={2}
                        placeholder="Poznámky k položce..."
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Zjištěné závady */}
      {defects.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-red-900 mb-4">
            Zjištěné závady ({defects.length})
          </h4>
          <div className="space-y-4">
            {defects.map((defect) => (
              <div key={defect.id} className="bg-white border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium text-gray-900">{defect.item_name}</h5>
                    <p className="text-sm text-gray-600">{defect.section}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDefect(defect.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Závažnost</label>
                    <select
                      value={defect.severity}
                      onChange={(e) => handleDefectChange(defect.id, 'severity', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    >
                      <option value="low">Nízká</option>
                      <option value="medium">Střední</option>
                      <option value="high">Vysoká</option>
                      <option value="critical">Kritická</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={defect.requires_service}
                      onChange={(e) => handleDefectChange(defect.id, 'requires_service', e.target.checked)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Vyžaduje servisní zásah
                    </label>
                  </div>
                </div>
                
                <textarea
                  value={defect.description}
                  onChange={(e) => handleDefectChange(defect.id, 'description', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  rows={2}
                  placeholder="Popis závady..."
                  required
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Celkové poznámky */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Poznámky obsluhy
        </label>
        <textarea
          value={formData.operator_observations}
          onChange={(e) => setFormData(prev => ({ ...prev, operator_observations: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={3}
          placeholder="Další pozorování, připomínky..."
        />
      </div>

      {/* Výsledek kontroly */}
      <div className="bg-gray-50 px-4 py-3 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Celkový výsledek:</span>
          <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
            calculateOverallResult() === 'passed' ? 'bg-green-100 text-green-800' :
            calculateOverallResult() === 'passed_with_remarks' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {calculateOverallResult() === 'passed' ? '✅ Vyhovuje' :
             calculateOverallResult() === 'passed_with_remarks' ? '⚠️ Vyhovuje s připomínkami' :
             '❌ Nevyhovuje'}
          </span>
        </div>
        {defects.filter(d => d.requires_service).length > 0 && (
          <div className="mt-2 text-sm text-red-700">
            ⚠️ Budou automaticky vytvořeny servisní požadavky pro kritické závady
          </div>
        )}
      </div>

      {/* Tlačítka */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Zrušit
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {loading ? 'Ukládám...' : 'Dokončit kontrolu'}
        </button>
      </div>
    </form>
  );
};

export default ControlChecklistForm;