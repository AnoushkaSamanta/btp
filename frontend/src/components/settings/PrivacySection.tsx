import React, { useState } from 'react';
import { PrivacySettings } from '../../lib/settings';

interface PrivacySectionProps {
  privacy: PrivacySettings;
  onChange: (updated: PrivacySettings) => void;
  onExportData: () => void;
  onClearLocalData: () => void;
  isExporting?: boolean;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  privacy,
  onChange,
  onExportData,
  onClearLocalData,
  isExporting = false,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-xl">🔒</span> Privacy & Data Security
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage clinical data synchronization, cryptographic storage, and local backups in compliance with DISHA / ABDM guidelines.
        </p>
      </div>

      {/* Data Storage Mode */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Data Storage Mode
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose whether maternal and child records remain cached strictly on this handset or synchronized with the PHC server.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
              privacy.dataStorage === 'local_only'
                ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm'
                : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="dataStorage"
              value="local_only"
              checked={privacy.dataStorage === 'local_only'}
              onChange={() => onChange({ ...privacy, dataStorage: 'local_only' })}
              className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 cursor-pointer"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Local only
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Offline-first storage on this device. Works in remote sub-centers without cellular data.
              </p>
            </div>
          </label>

          <label
            className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
              privacy.dataStorage === 'sync_backend'
                ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-500 shadow-sm'
                : 'border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <input
              type="radio"
              name="dataStorage"
              value="sync_backend"
              checked={privacy.dataStorage === 'sync_backend'}
              onChange={() => onChange({ ...privacy, dataStorage: 'sync_backend' })}
              className="mt-0.5 w-4 h-4 text-emerald-600 border-gray-300 dark:border-gray-600 focus:ring-emerald-500 dark:focus:ring-emerald-600 cursor-pointer"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Sync to backend
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Back up patient cards to the PHC server for remote tele-consultation and supervisor reviews.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Patient Data Actions */}
      <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Patient Data & Backups
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Export all beneficiary records, immunization rosters, and visit trails as an archival package.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onExportData}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/70 shadow-sm hover:border-gray-300 transition-all disabled:opacity-60 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${
                isExporting ? 'animate-spin' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {isExporting ? 'Exporting...' : 'Export my data (.json)'}
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-sm font-semibold text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete all local data
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-100 dark:bg-red-950/70 p-2 rounded-xl border border-red-300 dark:border-red-800">
              <span className="text-xs font-semibold text-red-800 dark:text-red-300">
                Confirm wipe of cached records?
              </span>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(false);
                  onClearLocalData();
                }}
                className="px-2.5 py-1 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Yes, Wipe
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Encryption & Security */}
      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Encryption & Access Protection
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Complies with health record confidentiality standards for community healthcare workers.
          </p>
        </div>

        <div className="space-y-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Encrypt stored data
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AES-256 client-side encryption for offline patient databases.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacy.encryptStoredData}
              onChange={(e) => onChange({ ...privacy, encryptStoredData: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 dark:border-gray-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer pt-3 border-t border-gray-200/60 dark:border-gray-800">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Require PIN to open app
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prompts for 4-digit security PIN before displaying patient lists.
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacy.requirePinToOpen}
              onChange={(e) => onChange({ ...privacy, requirePinToOpen: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 dark:border-gray-600 focus:ring-emerald-500"
            />
          </label>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200/60 dark:border-gray-800">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Auto-lock session after inactivity
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Locks the tablet/screen when left unattended during field visits.
              </p>
            </div>
            <select
              value={privacy.autoLockMinutes}
              onChange={(e) =>
                onChange({ ...privacy, autoLockMinutes: Number(e.target.value) })
              }
              className="px-3 py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min (Default)</option>
              <option value={60}>60 min</option>
              <option value={0}>Never</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
