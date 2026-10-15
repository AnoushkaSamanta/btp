import React, { useState } from 'react';
import { ListTodo, CheckSquare, Square, Calendar, Plus } from 'lucide-react';

interface TaskQueueProps {
  data?: {
    total_pending?: number;
    tasks?: Array<{
      id: string;
      title: string;
      patient_name?: string;
      due?: string;
      done?: boolean;
    }>;
  };
  onNavigateToSchedule?: () => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({
  data,
  onNavigateToSchedule,
}) => {
  const initialTasks = data?.tasks || [
    { id: 't1', title: 'Revisit Lakshmi Devi in 2 weeks (BP & pre-eclampsia check)', patient_name: 'Lakshmi Devi', due: 'Oct 24', done: false },
    { id: 't2', title: 'Escalate Sunita Kumari to PHC for gestational HTN evaluation', patient_name: 'Sunita Kumari', due: 'Tomorrow', done: false },
    { id: 't3', title: 'Verify JSY documents & Aadhaar linking for Priya Sharma', patient_name: 'Priya Sharma', due: 'Oct 18', done: false },
    { id: 't4', title: 'Complete PMMVY first installment enrollment for Rina Devi', patient_name: 'Rina Devi', due: 'Oct 20', done: false },
  ];

  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
    );
  };

  const pendingCount = tasks.filter((t) => !t.done).length;

  return (
    <div className="glass-card p-5 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Follow-up Tasks
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50">
                {pendingCount} Pending
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">Synthesized by Report Generator Agent</p>
          </div>
        </div>

        {onNavigateToSchedule && (
          <button
            type="button"
            onClick={onNavigateToSchedule}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            View Schedule
          </button>
        )}
      </div>

      <div className="space-y-2">
        {tasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
              task.done
                ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/60 opacity-60'
                : 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-amber-300'
            }`}
          >
            <button
              type="button"
              className="mt-0.5 text-slate-400 hover:text-amber-600"
            >
              {task.done ? (
                <CheckSquare className="w-4 h-4 text-emerald-500" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p
                className={`text-xs font-medium ${
                  task.done
                    ? 'line-through text-slate-400'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {task.title}
              </p>
              {task.due && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" /> Due {task.due}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
