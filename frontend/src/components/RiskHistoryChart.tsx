import { useState, useEffect } from 'react';
import { Activity, TrendingUp, HeartPulse, Scale, Droplet } from 'lucide-react';
import { fetchPatientTrends } from '@/lib/api';

interface TrendPoint {
  date: string;
  systolic: number;
  diastolic: number;
  weight: number;
  hemoglobin: number;
}

interface RiskHistoryChartProps {
  patientId: string;
  currentBp: string;
}

export function RiskHistoryChart({ patientId, currentBp }: RiskHistoryChartProps) {
  const [trends, setTrends] = useState<TrendPoint[]>([
    { date: 'Aug 10', systolic: 120, diastolic: 78, weight: 64.0, hemoglobin: 9.5 },
    { date: 'Aug 28', systolic: 124, diastolic: 80, weight: 65.5, hemoglobin: 9.1 },
    { date: 'Sep 15', systolic: 130, diastolic: 84, weight: 67.0, hemoglobin: 8.7 },
    { date: 'Sep 28', systolic: 135, diastolic: 88, weight: 68.0, hemoglobin: 8.4 },
    { date: 'Oct 04', systolic: 140, diastolic: 90, weight: 68.5, hemoglobin: 8.2 },
  ]);
  const [activeMetric, setActiveMetric] = useState<'bp' | 'weight' | 'hb'>('bp');

  useEffect(() => {
    fetchPatientTrends(patientId)
      .then((data: { trends?: TrendPoint[] }) => {
        if (data.trends && data.trends.length > 0) {
          setTrends(data.trends);
        }
      })
      .catch(() => undefined);
  }, [patientId]);

  const maxSys = Math.max(...trends.map((t) => t.systolic), 150);
  const minSys = Math.min(...trends.map((t) => t.systolic), 110);

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-error-50 text-error-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800">Clinical Vitals & Risk Trends</h5>
            <p className="text-[10px] text-slate-400">Progression across ANC visits</p>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMetric('bp')}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
              activeMetric === 'bp' ? 'bg-error-500 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Blood Pressure
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('weight')}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
              activeMetric === 'weight' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weight
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('hb')}
            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
              activeMetric === 'hb' ? 'bg-accent-500 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hemoglobin
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="pt-2">
        <div className="h-32 w-full flex items-end justify-between gap-2 px-3 pb-2 border-b border-l border-slate-200 relative">
          {/* Threshold reference line for Hypertension (140) */}
          {activeMetric === 'bp' && (
            <div
              className="absolute left-0 right-0 border-b border-dashed border-error-400/80 z-0 flex items-center justify-end pr-2"
              style={{ bottom: '72%' }}
            >
              <span className="text-[9px] font-bold text-error-600 bg-white/90 px-1 rounded">
                140 High Risk Threshold
              </span>
            </div>
          )}

          {trends.map((pt, idx) => {
            let heightPct = 50;
            let displayVal = `${pt.systolic}/${pt.diastolic}`;
            let barColor = 'bg-primary-500';

            if (activeMetric === 'bp') {
              heightPct = Math.round(((pt.systolic - 100) / (160 - 100)) * 100);
              barColor = pt.systolic >= 140 ? 'bg-error-500' : 'bg-primary-500';
              displayVal = `${pt.systolic}/${pt.diastolic}`;
            } else if (activeMetric === 'weight') {
              heightPct = Math.round(((pt.weight - 50) / (80 - 50)) * 100);
              barColor = 'bg-sky-500';
              displayVal = `${pt.weight}kg`;
            } else if (activeMetric === 'hb') {
              heightPct = Math.round(((pt.hemoglobin - 6) / (14 - 6)) * 100);
              barColor = pt.hemoglobin < 9 ? 'bg-accent-500' : 'bg-success-500';
              displayVal = `${pt.hemoglobin}g`;
            }

            return (
              <div key={pt.date} className="flex-1 flex flex-col items-center gap-1 z-10 group relative">
                <span className="text-[10px] font-bold text-slate-700 opacity-90 group-hover:scale-110 transition-transform">
                  {displayVal}
                </span>
                <div
                  className={`w-6 sm:w-8 rounded-t-lg transition-all duration-300 ${barColor} shadow-sm group-hover:brightness-110`}
                  style={{ height: `${Math.max(heightPct, 15)}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-400 mt-1">{pt.date}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
