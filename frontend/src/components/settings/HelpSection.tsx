import React from 'react';
import { HelpCircle, BookOpen, Video, MessageCircle, Phone, Mail } from 'lucide-react';

export const HelpSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Help & Support
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Access field operation guides, training materials, and direct clinical or technical helpdesks.
        </p>
      </div>

      {/* Support Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* User Guide */}
        <a
          href="https://nhm.gov.in/index1.php?lang=1&level=1&sublinkid=150&lid=226"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                User Guide
              </h4>
              <span className="text-xs text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                ↗
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Comprehensive handbook on ANC checklists, immunization logs, and referral triage.
            </p>
          </div>
        </a>

        {/* Video Tutorials */}
        <a
          href="https://www.youtube.com/results?search_query=ASHA+worker+training+guidelines+MoHFW"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Video Tutorials
              </h4>
              <span className="text-xs text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                ↗
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Step-by-step videos in Hindi & English demonstrating patient registration & voice notes.
            </p>
          </div>
        </a>

        {/* WhatsApp Support */}
        <a
          href="https://wa.me/919876543210?text=Hello%20ASHA%20Support%2C%20I%20need%20help%20with%20ASHA%20Co-Pilot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                WhatsApp Support
              </h4>
              <span className="text-xs text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                ↗
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Chat directly with our technical support team for app assistance or bugs.
            </p>
          </div>
        </a>

        {/* Call Support / National Helplines */}
        <a
          href="tel:1075"
          className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800/60 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Call Support (Toll-Free)
              </h4>
              <span className="text-xs text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                1075
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              National Health Helpline: <strong className="text-gray-700 dark:text-gray-200">1075</strong> / Health Line: <strong className="text-gray-700 dark:text-gray-200">104</strong>
            </p>
          </div>
        </a>
      </div>

      {/* Official Email Block */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Official Support Email</div>
            <a
              href="mailto:support@asha-copilot.in"
              className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              support@asha-copilot.in
            </a>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Response turnaround: within 24 hours
        </div>
      </div>
    </div>
  );
};
