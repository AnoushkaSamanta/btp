import React, { useRef } from 'react';
import { Camera, MapPin, Building2, User, Phone, BadgeCheck, ShieldAlert } from 'lucide-react';
import type { ProfileSettings } from '@/lib/settings';

interface ProfileSectionProps {
  profile: ProfileSettings;
  onChange: (updated: Partial<ProfileSettings>) => void;
}

const VILLAGES = [
  'Ramnagar',
  'Shampur',
  'Belgachia',
  'Kalyanpur',
  'Bishnupur',
  'Fatehpur',
  'Dharampur',
];

export const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onChange({ photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() || '')
      .join('') || 'RS';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h4 className="text-base font-display font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-600" />
          Health Worker Profile
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Official accreditation, primary health jurisdiction, and contact credentials.
        </p>
      </div>

      {/* Avatar & Identification Badge */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-emerald-50/30 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-200/60 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="relative group">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.workerName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-2xl flex items-center justify-center shadow-md">
              {getInitials(profile.workerName)}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700 hover:text-emerald-600 hover:scale-105 transition-all"
            title="Change Photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{profile.workerName}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <BadgeCheck className="w-3 h-3 text-emerald-600" />
              Verified ASHA
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Accredited Social Health Activist · {profile.village} Catchment
          </p>
          <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 font-semibold">
            ID: {profile.workerId}
          </p>
          <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Change Photo
            </button>
            {profile.photoUrl && (
              <button
                type="button"
                onClick={() => onChange({ photoUrl: '' })}
                className="text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
              >
                · Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Form Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</span>
          <div className="relative mt-1">
            <input
              type="text"
              value={profile.workerName}
              onChange={(e) => onChange({ workerName: e.target.value })}
              className="input-field pl-9"
              placeholder="e.g. Rekha Singh"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</span>
          <div className="relative mt-1">
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="input-field pl-9"
              placeholder="+91 98765 43210"
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Village / Area</span>
          <div className="relative mt-1">
            <select
              value={profile.village}
              onChange={(e) => onChange({ village: e.target.value })}
              className="input-field pl-9 appearance-none"
            >
              {VILLAGES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Worker ID (National Health Mission)</span>
          <div className="relative mt-1">
            <input
              type="text"
              value={profile.workerId}
              onChange={(e) => onChange({ workerId: e.target.value })}
              className="input-field pl-9 font-mono"
              placeholder="ASHA-BHR-0421"
            />
            <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Supervisor / Medical Officer</span>
          <div className="relative mt-1">
            <input
              type="text"
              value={profile.supervisor}
              onChange={(e) => onChange({ supervisor: e.target.value })}
              className="input-field pl-9"
              placeholder="Dr. Amit Kumar"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Primary Health Centre (PHC)</span>
          <div className="relative mt-1">
            <input
              type="text"
              value={profile.phc}
              onChange={(e) => onChange({ phc: e.target.value })}
              className="input-field pl-9"
              placeholder="Ramnagar PHC"
            />
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </label>
      </div>
    </div>
  );
};
