import { MapPin, ChevronDown } from 'lucide-react';

interface VillageFilterProps {
  selectedVillage: string;
  villages: string[];
  onChange: (village: string) => void;
}

export function VillageFilter({ selectedVillage, villages, onChange }: VillageFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={selectedVillage}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Filter by village"
          className="pl-9 pr-8 py-2 text-sm font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer shadow-sm"
        >
          <option value="All">All Villages</option>
          {villages.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
