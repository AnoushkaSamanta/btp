import { useState, useRef } from 'react';
import { Camera, Upload, User } from 'lucide-react';
import { uploadPatientPhotoApi } from '@/lib/api';

interface PhotoUploadProps {
  patientId: string;
  name: string;
  photoUrl?: string;
  onPhotoUpdated: (url: string) => void;
}

export function PhotoUpload({ patientId, name, photoUrl, onPhotoUpdated }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    // Convert to Data URL for instant rendering & local persistence
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await uploadPatientPhotoApi(patientId, dataUrl);
        onPhotoUpdated(dataUrl);
      } catch {
        onPhotoUpdated(dataUrl);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/60 shadow-md flex items-center justify-center relative transition-transform group-hover:scale-105">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xl font-display font-bold text-white tracking-wide">
            {getInitials(name)}
          </span>
        )}

        {/* Hover overlay with camera icon */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera className="w-5 h-5 text-white drop-shadow" />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
