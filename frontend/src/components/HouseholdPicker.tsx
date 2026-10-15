import React, { useState, useRef, useEffect } from 'react';
import { Search, Users, ChevronDown, Check, X } from 'lucide-react';
import type { Patient } from '@/types';

interface HouseholdPickerProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  disabled?: boolean;
}

export function HouseholdPicker({
  patients,
  selectedPatientId,
  onSelectPatient,
  disabled = false,
}: HouseholdPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.village && p.village.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 ${
          selectedPatient
            ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-200'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xs'}`}
        title="Link visit note to a registered household/patient"
      >
        <Users className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
        <span className="truncate max-w-[190px]">
          {selectedPatient ? (
            <span>
              <strong className="font-semibold">{selectedPatient.name}</strong>
              {selectedPatient.village ? ` · ${selectedPatient.village}` : ''}
              {selectedPatient.trimester ? ` · ${selectedPatient.trimester}` : ''}
            </span>
          ) : (
            'Link household (optional)'
          )}
        </span>
        {selectedPatient ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPatient('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                onSelectPatient('');
              }
            }}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Unlink household"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 w-72 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-up">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search patient, village..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
            <button
              type="button"
              onClick={() => {
                onSelectPatient('');
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                !selectedPatientId ? 'bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 font-semibold' : 'text-slate-500'
              }`}
            >
              <span>None (Don't link)</span>
              {!selectedPatientId && <Check className="w-3.5 h-3.5 text-primary-600" />}
            </button>

            {filtered.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No matching patients found.
              </div>
            ) : (
              filtered.map((patient) => {
                const isSelected = patient.id === selectedPatientId;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      onSelectPatient(patient.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between gap-2 hover:bg-primary-50/60 dark:hover:bg-slate-800 transition-colors ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100 font-medium'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {patient.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {patient.village || 'No village'}
                        {patient.trimester ? ` · ${patient.trimester} trim` : ''}
                        {patient.age ? ` · ${patient.age}y` : ''}
                        {patient.status === 'critical' ? ' · ⚠️ High Risk' : ''}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-primary-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HouseholdPicker;
