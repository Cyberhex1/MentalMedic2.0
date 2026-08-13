import React, { useState } from 'react';
import { Activity, Plus, Heart, AlertCircle, FileSpreadsheet, Calendar, Sparkles, Filter, Trash2, Download, Copy, Check, Pill, MapPin } from 'lucide-react';
import { SymptomLog } from '../types';

interface MedicalSymptomsTabProps {
  symptomLogs: SymptomLog[];
  onAddLog: (log: Omit<SymptomLog, 'id' | 'timestamp' | 'date'>) => void;
  onDeleteLog: (id: string) => void;
}

const COMMON_SYMPTOMS = [
  'Heart Racing / Palpitations',
  'Executive Freeze State',
  'Brain Fog / Dissociation',
  'Muscle Tension / Tight Jaw',
  'Chest Tightness / Dread',
  'Physical Fatigue / Heavy Limbs',
  'Tremors / Shaky Hands',
  'Migraine / Sensory Overload',
];

const BODY_LOCATIONS = [
  'Head / Brain Fog',
  'Chest / Racing Heart',
  'Throat / Tight Jaw',
  'Stomach / Gut Tension',
  'Hands / Shaky Fingers',
  'Shoulders / Back Rigidity',
];

const COPING_METHODS = [
  '4-7-8 Breathing Cycle',
  'Cold Water Wrists / Face',
  '5-4-3-2-1 Grounding',
  'Physiological Sigh',
  'Rest in Dark / Eye Mask',
  'Bilateral Tapping / Touch',
];

interface MedItem {
  id: string;
  name: string;
  dosage: string;
  timeTaken: string;
}

export const MedicalSymptomsTab: React.FC<MedicalSymptomsTabProps> = ({
  symptomLogs,
  onAddLog,
  onDeleteLog,
}) => {
  const [symptomName, setSymptomName] = useState<string>(COMMON_SYMPTOMS[0]);
  const [bodyLocation, setBodyLocation] = useState<string>(BODY_LOCATIONS[0]);
  const [customSymptom, setCustomSymptom] = useState<string>('');
  const [severity, setSeverity] = useState<number>(5);
  const [triggers, setTriggers] = useState<string>('');
  const [copingMethod, setCopingMethod] = useState<string>(COPING_METHODS[0]);
  const [notes, setNotes] = useState<string>('');
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [filterSymptom, setFilterSymptom] = useState<string>('all');

  // Medication / Supplement Tracker state
  const [meds, setMeds] = useState<MedItem[]>([
    { id: '1', name: 'Magnesium Glycinate', dosage: '200mg', timeTaken: 'Morning' },
    { id: '2', name: 'L-Theanine / Hydration', dosage: '100mg', timeTaken: 'Before Work' },
  ]);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setMeds((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newMedName.trim(),
        dosage: newMedDosage.trim() || 'Standard',
        timeTaken: 'Daily',
      },
    ]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleDeleteMed = (id: string) => {
    setMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeSymptom = customSymptom.trim() || symptomName;
    if (!activeSymptom) return;

    onAddLog({
      symptomName: `${activeSymptom} (${bodyLocation})`,
      severity,
      triggers: triggers.trim() || undefined,
      copingMethod: copingMethod || undefined,
      notes: notes.trim() || undefined,
    });

    setCustomSymptom('');
    setTriggers('');
    setNotes('');
  };

  const getSeverityBadge = (sev: number) => {
    if (sev <= 3) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (sev <= 6) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
  };

  const handleDownloadDoctorCSV = () => {
    const headers = ['Date', 'Symptom & Location', 'Severity (1-10)', 'Triggers', 'Coping Method', 'Notes'];
    const rows = symptomLogs.map((l) => [
      `"${l.date}"`,
      `"${(l.symptomName || '').replace(/"/g, '""')}"`,
      l.severity,
      `"${(l.triggers || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.copingMethod || 'N/A').replace(/"/g, '""')}"`,
      `"${(l.notes || 'N/A').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MentalMedic_Doctor_Symptom_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReport = () => {
    const reportText = `=== MENTAL MEDIC SOMATIC SYMPTOM LOG REPORT ===
Generated: ${new Date().toLocaleDateString()}
Total Logged Incidents: ${symptomLogs.length}

Medications & Supplements:
${meds.map((m) => `- ${m.name} (${m.dosage}) [${m.timeTaken}]`).join('\n')}

Symptom Records:
${symptomLogs
  .map(
    (l) =>
      `[${l.date}] ${l.symptomName} | Severity: ${l.severity}/10
- Trigger: ${l.triggers || 'N/A'}
- Coping Method: ${l.copingMethod || 'N/A'}
- Notes: ${l.notes || 'None'}`
  )
  .join('\n\n')}
`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 3000);
  };

  const avgSeverity =
    symptomLogs.length > 0
      ? (symptomLogs.reduce((acc, l) => acc + l.severity, 0) / symptomLogs.length).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pink-500" />
            <span>Somatic Symptoms & Health Log</span>
          </h3>
          <p className="text-xs text-slate-500">
            Track physical distress, dread spikes, body locations, and effective coping strategies.
          </p>
        </div>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-pink-100 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Incident Logs</span>
          <span className="text-xl font-black text-slate-800 font-mono">{symptomLogs.length}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-pink-100 text-center shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Distress Level</span>
          <span className="text-xl font-black text-pink-600 font-mono">{avgSeverity} / 10</span>
        </div>
      </div>

      {/* New Log Form */}
      <form onSubmit={handleSubmit} className="bg-pink-50/50 border border-pink-100 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-pink-500" />
          <span>Log Somatic Incident / Physical Symptom</span>
        </h4>

        <div className="grid md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Select Symptom Type</label>
            <select
              value={symptomName}
              onChange={(e) => setSymptomName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium cursor-pointer"
            >
              {COMMON_SYMPTOMS.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Body Location</label>
            <select
              value={bodyLocation}
              onChange={(e) => setBodyLocation(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium cursor-pointer"
            >
              {BODY_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Custom Symptom (Optional)</label>
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="Or type specific physical sensation..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        {/* Severity Slider */}
        <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-700">Distress / Intensity Level (1 to 10):</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono border ${getSeverityBadge(severity)}`}>
              {severity} / 10
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={severity}
            onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-100 rounded-lg accent-pink-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>1 (Barely noticeable)</span>
            <span>5 (Moderate discomfort)</span>
            <span>10 (Severe freeze/panic)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Apparent Trigger</label>
            <input
              type="text"
              value={triggers}
              onChange={(e) => setTriggers(e.target.value)}
              placeholder="e.g. Email notification, noise, impending deadline..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Coping Method Applied</label>
            <select
              value={copingMethod}
              onChange={(e) => setCopingMethod(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-pink-500 font-medium cursor-pointer"
            >
              {COPING_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">Additional Notes / Observations</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did your body respond after grounding? What helped?"
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-pink-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-pink-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Save Symptom Entry</span>
        </button>
      </form>

      {/* Medication & Supplement Tracker Section */}
      <div className="bg-white border border-pink-100 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Pill className="w-4 h-4 text-pink-500" />
            <span>Medications & Somatic Supplements</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold">{meds.length} Active Items</span>
        </div>

        <form onSubmit={handleAddMed} className="flex gap-2">
          <input
            type="text"
            value={newMedName}
            onChange={(e) => setNewMedName(e.target.value)}
            placeholder="Item name (e.g. Magnesium, Electrolytes)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-500"
          />
          <input
            type="text"
            value={newMedDosage}
            onChange={(e) => setNewMedDosage(e.target.value)}
            placeholder="Dosage (e.g. 200mg)..."
            className="w-28 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold border border-pink-200 text-xs rounded-xl cursor-pointer"
          >
            + Add
          </button>
        </form>

        <div className="grid sm:grid-cols-2 gap-2 pt-1">
          {meds.map((med) => (
            <div
              key={med.id}
              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/80 flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <p className="font-bold text-slate-800">{med.name}</p>
                <p className="text-[10px] text-slate-400">{med.dosage} • {med.timeTaken}</p>
              </div>
              <button
                onClick={() => handleDeleteMed(med.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logs History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800">Somatic Log History</h4>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            {symptomLogs.length} Total Records
          </span>
        </div>

        {symptomLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No health logs recorded yet. Log an entry above when you experience physical tension or executive freeze.
          </div>
        ) : (
          <div className="space-y-3">
            {symptomLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-slate-100 hover:border-pink-100 rounded-2xl p-4 shadow-sm space-y-2 relative group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getSeverityBadge(log.severity)}`}>
                      Severity {log.severity}/10
                    </span>
                    <h5 className="text-xs font-bold text-slate-800">{log.symptomName}</h5>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  {log.triggers && (
                    <p>
                      <span className="font-semibold text-slate-700">Trigger:</span> {log.triggers}
                    </p>
                  )}
                  {log.copingMethod && (
                    <p>
                      <span className="font-semibold text-pink-600">Coping Method:</span> {log.copingMethod}
                    </p>
                  )}
                  {log.notes && (
                    <p className="italic text-slate-500 bg-slate-50 p-2 rounded-xl mt-1 border border-slate-100">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export & Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex flex-col justify-center items-center text-center shadow-sm">
          <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block mb-1">Most Effective Coping Strategy</span>
          <span className="text-sm font-extrabold text-slate-800 break-words mt-1">
            {symptomLogs.length > 0 && symptomLogs[0]?.copingMethod ? symptomLogs[0].copingMethod : 'Grounding Breathing'}
          </span>
          <p className="text-[10px] text-slate-500 mt-2">Based on your recent logs.</p>
        </div>

        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 flex flex-col justify-center items-center gap-3 shadow-sm">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">Export Data</span>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
            <button
              onClick={handleDownloadDoctorCSV}
              className="w-full px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Download formatted CSV spreadsheet for doctor or therapy appointment"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Doctor CSV</span>
            </button>

            <button
              onClick={handleExportReport}
              className="w-full px-3.5 py-2 rounded-xl bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-pink-500" />}
              <span>{copiedReport ? 'Copied!' : 'Copy Info'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
