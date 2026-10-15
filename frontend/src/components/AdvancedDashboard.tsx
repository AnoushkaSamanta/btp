import { useState, useEffect } from 'react';
import { FlaskConical, Cpu, Database, Activity, Radio, RotateCcw, Terminal } from 'lucide-react';
import { AgentPipelineCard } from './AgentPipelineCard';
import { VoiceReadBackLog } from './VoiceReadBackLog';
import { RAGCitationsPanel } from './RAGCitationsPanel';
import { EvaluationSnapshot } from './EvaluationSnapshot';
import { SystemHealth } from './SystemHealth';
import { AblationCard } from './AblationCard';
import { ConfirmationLoopStatus } from './ConfirmationLoopStatus';
import { VoiceCommandLog } from './VoiceCommandLog';
import { WeeklyProgress } from './WeeklyProgress';
import {
  fetchPipelineStatus,
  fetchVoiceReadBackLog,
  fetchRAGStats,
  fetchEvaluationSnapshot,
  fetchSystemHealth,
  fetchVoiceInputs,
  fetchWeeklyProgress,
  fetchConfirmationLoop,
} from '@/lib/api';
import type { ViewId } from '@/types';

interface AdvancedDashboardProps {
  onNavigate: (view: ViewId) => void;
  onReload?: () => void;
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="text-violet-500 dark:text-violet-400">{icon}</span>
      <span className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800 ml-1" />
    </div>
  );
}

export function AdvancedDashboard({ onNavigate, onReload }: AdvancedDashboardProps) {
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [voiceLogData, setVoiceLogData] = useState<any>(null);
  const [ragStatsData, setRagStatsData] = useState<any>(null);
  const [evalData, setEvalData] = useState<any>(null);
  const [healthData, setHealthData] = useState<any>(null);
  const [voiceInputsData, setVoiceInputsData] = useState<any>(null);
  const [weeklyProgressData, setWeeklyProgressData] = useState<any>(null);
  const [confirmationLoopData, setConfirmationLoopData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.allSettled([
      fetchPipelineStatus().then(setPipelineData).catch(() => undefined),
      fetchVoiceReadBackLog().then(setVoiceLogData).catch(() => undefined),
      fetchRAGStats().then(setRagStatsData).catch(() => undefined),
      fetchEvaluationSnapshot().then(setEvalData).catch(() => undefined),
      fetchSystemHealth().then(setHealthData).catch(() => undefined),
      fetchVoiceInputs().then(setVoiceInputsData).catch(() => undefined),
      fetchWeeklyProgress().then(setWeeklyProgressData).catch(() => undefined),
      fetchConfirmationLoop().then(setConfirmationLoopData).catch(() => undefined),
    ]).finally(() => setLoading(false));
    onReload?.();
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-slate-100">Advanced / Developer View</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline metrics, evaluation &amp; system health — not shown to ASHA workers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <SectionLabel icon={<Cpu className="w-4 h-4" />} label="Agent Pipeline" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentPipelineCard data={pipelineData} />
        <VoiceReadBackLog data={voiceLogData} />
      </div>

      <SectionLabel icon={<Database className="w-4 h-4" />} label="RAG Knowledge Base" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RAGCitationsPanel data={ragStatsData} onBrowseProtocols={() => onNavigate('resources')} />
        <WeeklyProgress data={weeklyProgressData} />
      </div>

      <SectionLabel icon={<FlaskConical className="w-4 h-4" />} label="Evaluation &amp; Ablation" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvaluationSnapshot data={evalData} onAblationRan={loadData} />
        <AblationCard data={evalData} onBenchmarkFinished={loadData} />
      </div>

      <SectionLabel icon={<Activity className="w-4 h-4" />} label="System Health" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemHealth data={healthData} />
        <ConfirmationLoopStatus data={confirmationLoopData} onReviewConfirmations={() => onNavigate('voice')} />
      </div>

      <SectionLabel icon={<Radio className="w-4 h-4" />} label="Recent Voice Inputs" />
      <div className="grid grid-cols-1 gap-6">
        <VoiceCommandLog data={voiceInputsData} onNavigateToVoice={() => onNavigate('voice')} />
      </div>
    </div>
  );
}
