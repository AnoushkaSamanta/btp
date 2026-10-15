import React from 'react';
import { GitBranch, CheckCircle2, Clock, Cpu, ShieldCheck } from 'lucide-react';

interface AgentPipelineCardProps {
  data?: {
    mode?: string;
    total_latency_s?: number;
    supervisor?: { name: string; status: string };
    agents?: Array<{
      name: string;
      role: string;
      last_latency_s: number;
      status: string;
      version?: string;
    }>;
  };
}

export const AgentPipelineCard: React.FC<AgentPipelineCardProps> = ({ data }) => {
  const agents = data?.agents || [
    { name: 'Structuring Agent', role: 'Speech slot filling & FHIR format', last_latency_s: 0.3, status: 'ok' },
    { name: 'Protocol Check Agent', role: 'Hardcoded red flags & clinical triage', last_latency_s: 0.5, status: 'ok' },
    { name: 'Scheme Match Agent', role: 'Deterministic entitlement engine', last_latency_s: 0.2, status: 'ok' },
    { name: 'Report Generator', role: 'Follow-up tasks & Indic read-back', last_latency_s: 0.4, status: 'ok' },
  ];

  const totalLatency = data?.total_latency_s ?? 1.4;

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Agent Pipeline
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">LangGraph Supervisor orchestration</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
            {totalLatency}s
          </span>
          <p className="text-[10px] text-slate-400">E2E Latency</p>
        </div>
      </div>

      <div className="space-y-2">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100/60 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {agent.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                {agent.last_latency_s}s
              </span>
            </div>
          </div>
        ))}

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-primary-500" />
            Mode: <strong>Multi-Agent (4 specialized)</strong>
          </span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Supervisor Active
          </span>
        </div>
      </div>
    </div>
  );
};
