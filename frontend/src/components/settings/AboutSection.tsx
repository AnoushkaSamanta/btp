import React from 'react';
import { Info } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> About ASHA Co-Pilot
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Clinical decision support & digital field assistant for Accredited Social Health Activists (ASHAs).
        </p>
      </div>

      {/* App & Build Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
          A+
        </div>
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            ASHA Co-Pilot
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mt-0.5">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Version 1.0.0
            </span>
            <span>•</span>
            <span className="font-mono text-gray-500 dark:text-gray-400">
              Build: 2026-10-13
            </span>
            <span>•</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
              STABLE
            </span>
          </div>
        </div>
      </div>

      {/* Development & Institution */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Institution & Project Team
          </h5>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            IIIT Kottayam
          </span>
        </div>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            Developed as a B.Tech Capstone Project at the{' '}
            <strong className="text-gray-800 dark:text-gray-200">
              Indian Institute of Information Technology Kottayam (IIIT Kottayam)
            </strong>
            , dedicated to empowering community frontline healthcare workers across rural India.
          </p>

          <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Project Engineers:
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <li className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80">
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  Rohan Naidu
                </div>
                <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  2023BCS0148
                </div>
              </li>
              <li className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80">
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  Anoushka Samanta
                </div>
                <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  2023BCS0147
                </div>
              </li>
              <li className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80">
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  Adithya TJ
                </div>
                <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                  2023BCS0195
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3">
        <a
          href="https://github.com/AnoushkaSamanta/btp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          View on GitHub ↗
        </a>

        <a
          href="https://abdm.gov.in/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
        >
          Privacy Policy ↗
        </a>

        <a
          href="https://abdm.gov.in/terms-and-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline"
        >
          Terms of Service ↗
        </a>
      </div>
    </div>
  );
};
