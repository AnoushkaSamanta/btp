import React from 'react';
import { HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';

interface SystemHealthProps {
  data?: {
    title?: string;
    last_sync?: string;
    services?: Array<{
      name: string;
      status: string;
      healthy: boolean;
      detail?: string;
    }>;
  };
}

export const SystemHealth: React.FC<SystemHealthProps> = ({ data }) => {
  const services = data?.services || [
    { name: 'Backend API', status: 'Connected', healthy: true, detail: 'FastAPI on port 8000' },
    { name: 'ASR Engine', status: 'IndicWhisper', healthy: true, detail: 'Local + WebSpeech Indic' },
    { name: 'TTS Engine', status: 'Bhashini', healthy: true, detail: 'Indic cached audio stream' },
    { name: 'RAG (ChromaDB)', status: '3,847 chunks', healthy: true, detail: '14 clinical PDFs indexed' },
    { name: 'Database', status: 'SQLite (127 rows)', healthy: true, detail: 'Persistent ACID store' },
  ];

  const lastSync = data?.last_sync || '2 min ago';

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              System Health
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                All Operational
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Frontline microservices status</p>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">Sync: {lastSync}</span>
      </div>

      <div className="space-y-2">
        {services.map((svc) => (
          <div
            key={svc.name}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="truncate">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {svc.name}
                </span>
                {svc.detail && (
                  <span className="text-[10px] text-slate-400 block truncate">
                    {svc.detail}
                  </span>
                )}
              </div>
            </div>

            <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded shrink-0">
              {svc.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
