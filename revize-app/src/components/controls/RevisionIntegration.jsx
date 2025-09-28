import React, { useState } from 'react';
import RevisionForm from '../forms/RevisionForm';
import { createCraneRecord } from '../../services/craneRecordsService';

const RevisionIntegration = ({ 
  equipmentId, 
  controlDefects = [], 
  onComplete, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);

  const handleRevisionSubmit = async (revisionData) => {
    try {
      setLoading(true);
      
      // Vytvoř revizní záznam s vazbou na kontrolní závady
      const recordData = {
        equipment_id: equipmentId,
        record_category: 'revision',
        record_type: 'scheduled',
        title: 'Revize na základě kontrolních závad',
        description: `Revize vyvolaná závadami zjištěnými během kontrol: ${controlDefects.map(d => d.item_name).join(', ')}`,
        status: 'completed',
        result: revisionData.overall_result,
        severity: revisionData.overall_result === 'passed' ? 'info' : 'high',
        findings: revisionData.findings || revisionData.description,
        recommendations: revisionData.recommendations,
        maintenance_required: revisionData.overall_result !== 'passed',
        related_control_defects: controlDefects.map(d => d.id),
        revision_data: revisionData
      };

      await createCraneRecord(recordData);
      
      if (onComplete) {
        await onComplete(revisionData);
      }
    } catch (error) {
      console.error('Chyba při vytváření revizního záznamu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Přeformátuj kontrolní závady pro RevisionForm
  const formatDefectsForRevision = () => {
    return controlDefects.map(defect => ({
      id: defect.id,
      equipment_id: equipmentId,
      defect_type: 'control_finding',
      component: defect.section,
      description: `${defect.item_name}: ${defect.description}`,
      severity: defect.severity,
      requires_immediate_action: defect.requires_service,
      found_during_control: true,
      notes: defect.notes
    }));
  };

  // Předvyplň revizní formulář s kontrolními daty
  const getRevisionInitialValues = () => {
    const hasHighSeverityDefects = controlDefects.some(d => 
      d.severity === 'high' || d.severity === 'critical'
    );

    return {
      equipment_id: equipmentId,
      revision_date: new Date().toISOString().split('T')[0],
      revision_type: 'corrective',
      triggered_by_control: true,
      overall_result: hasHighSeverityDefects ? 'failed' : 'passed_with_remarks',
      description: `Revize provedena na základě ${controlDefects.length} závad zjištěných během kontrol.`,
      findings: controlDefects.map(d => 
        `• ${d.item_name} (${d.severity}): ${d.description || 'Bez popisu'}`
      ).join('\n'),
      recommendations: hasHighSeverityDefects 
        ? 'Nutná okamžitá náprava kritických závad před dalším použitím zařízení.'
        : 'Doporučujeme provést nápravná opatření v nejbližší době.',
      defects: formatDefectsForRevision()
    };
  };

  return (
    <div className="space-y-6">
      {/* Přehled kontrolních závad */}
      {controlDefects.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-orange-900 mb-3">
            Závady zjištěné při kontrolách ({controlDefects.length})
          </h4>
          <div className="space-y-2">
            {controlDefects.map((defect, index) => (
              <div key={defect.id || index} className="text-sm">
                <span className="font-medium text-orange-900">
                  {defect.item_name}
                </span>
                <span className="text-orange-700 ml-2">
                  ({defect.section})
                </span>
                {defect.description && (
                  <div className="text-orange-600 mt-1 ml-4">
                    {defect.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revizní formulář */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Revizní protokol
        </h3>
        <RevisionForm
          initialValues={getRevisionInitialValues()}
          onSubmit={handleRevisionSubmit}
          onCancel={onCancel}
          isLoading={loading}
          integrationMode="control_follow_up"
        />
      </div>
    </div>
  );
};

export default RevisionIntegration;