import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { fetchPatientVisits } from '@/lib/api';
import type { Visit } from '@/types';

interface PatientVisitsProps {
  patientId: string;
  patientName: string;
}

export function PatientVisits({ patientId, patientName }: PatientVisitsProps) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [filterType, setFilterType] = useState('All');

  useEffect(() => {
    fetchPatientVisits(patientId)
      .then((data: Visit[]) => {
        if (Array.isArray(data)) setVisits(data);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [patientId]);

  const filteredVisits = visits.filter((v) => {
    if (filterType === 'All') return true;
    return v.type.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-display font-bold text-slate-800 text-sm">
            Visit History ({visits.length} records)
          </h4>
          <p className="text-xs text-slate-400">Previous clinical checkups & outcomes</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {['All', 'ANC', 'PNC', 'High-Risk'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterType(tab)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                filterType === tab
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading visit history...</div>
      ) : filteredVisits.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-400">
          No past visits recorded for this category.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredVisits.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-primary-200 transition-all shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{v.type}</span>
                  <span className="text-xs text-slate-400 font-medium">({v.trimester || 'ANC'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{v.date} · {v.time}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedVisit(v)}
                    className="px-2 py-0.5 text-xs font-semibold rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                  >
                    View Full
                  </button>
                </div>
              </div>

              {v.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-700">Notes:</span> {v.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="card-elevated max-w-md w-full p-6 relative rounded-2xl shadow-2xl bg-white border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-display font-bold text-slate-900 text-base">Full Visit Record</h4>
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block">Patient</span>
                <span className="font-bold text-slate-900 text-sm">{patientName}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Visit Date</span>
                  <span className="font-semibold text-slate-800">{selectedVisit.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Time Slot</span>
                  <span className="font-semibold text-slate-800">{selectedVisit.time}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Visit Protocol Type</span>
                <span className="font-semibold text-slate-800">{selectedVisit.type}</span>
              </div>
              {selectedVisit.notes && (
                <div>
                  <span className="text-slate-400 block">Clinical Observations & Tasks</span>
                  <p className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed text-slate-700">
                    {selectedVisit.notes}
                  </p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVisit(null)}
                className="btn-ghost text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
