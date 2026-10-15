import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle2 } from 'lucide-react';
import type { Visit } from '@/types';

interface CalendarViewProps {
  visits: Visit[];
  onSelectVisit: (visit: Visit) => void;
  onSelectPatient: (patientId: string) => void;
}

const HOURS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

export function CalendarView({ visits, onSelectVisit, onSelectPatient }: CalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    return new Date(d.setDate(diff));
  });

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const handleNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const handleToday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(d.setDate(diff)));
  };

  const weekLabel = `${weekDays[0].toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  })} – ${weekDays[6].toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const parseHour = (timeStr: string): number => {
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/(\d+):?(\d*)\s*(AM|PM)?/);
    if (!match) return 10;
    let h = parseInt(match[1], 10);
    const meridiem = match[3];
    if (meridiem === 'PM' && h < 12) h += 12;
    if (meridiem === 'AM' && h === 12) h = 0;
    return h;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-300 hover:bg-success-200';
      case 'scheduled':
        return 'bg-sky-100 text-sky-800 border-sky-300 hover:bg-sky-200';
      case 'missed':
        return 'bg-error-100 text-error-800 border-error-300 hover:bg-error-200';
      default:
        return 'bg-accent-100 text-accent-800 border-accent-300 hover:bg-accent-200';
    }
  };

  return (
    <div className="card-elevated rounded-2xl p-4 bg-white border border-slate-200 shadow-sm overflow-x-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 min-w-[700px]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-800">{weekLabel}</span>
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevWeek}
            aria-label="Previous week"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextWeek}
            aria-label="Next week"
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="min-w-[700px]">
        {/* Days Header */}
        <div className="grid grid-cols-8 border-b border-slate-200 pb-2">
          <div className="text-xs font-bold text-slate-400 text-center">Time</div>
          {weekDays.map((day) => {
            const isToday = day.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
            return (
              <div key={day.toISOString()} className="text-center">
                <span className="block text-[11px] font-semibold text-slate-400 uppercase">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
                <span
                  className={`inline-block w-6 h-6 text-xs font-bold rounded-full leading-6 mt-0.5 ${
                    isToday ? 'bg-primary-600 text-white' : 'text-slate-700'
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hour Rows */}
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {HOURS.map((hourStr) => {
            const hNum = parseInt(hourStr.split(':')[0], 10);
            return (
              <div key={hourStr} className="grid grid-cols-8 min-h-[56px] py-1">
                <div className="text-[11px] font-semibold text-slate-400 text-center pt-1 border-r border-slate-100">
                  {hourStr}
                </div>
                {weekDays.map((day) => {
                  const dayIso = day.toISOString().slice(0, 10);
                  const cellVisits = visits.filter((v) => {
                    if (v.date !== dayIso) return false;
                    const vH = parseHour(v.time);
                    return vH === hNum;
                  });

                  return (
                    <div
                      key={dayIso + hourStr}
                      className="p-1 border-r border-slate-50 relative flex flex-col gap-1 min-h-[52px]"
                    >
                      {cellVisits.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onSelectVisit(v)}
                          className={`text-left p-1.5 rounded-lg border text-[11px] font-semibold leading-tight shadow-sm transition-all cursor-pointer block w-full truncate ${getStatusColor(
                            v.status
                          )}`}
                          title={`${v.patientName} (${v.type}) - ${v.time}`}
                        >
                          <div className="truncate font-bold">{v.patientName}</div>
                          <div className="text-[10px] opacity-80 truncate">{v.type}</div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
