import { useState, useEffect } from 'react';
import { FileText, Plus, User, Clock, X } from 'lucide-react';
import { fetchPatientNotes, addPatientNoteApi } from '@/lib/api';

interface NoteItem {
  date: string;
  text: string;
  author: string;
}

interface PatientNotesProps {
  patientId: string;
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      date: '2026-10-04',
      text: 'BP elevated at 140/90. Advised rest and low-salt diet. Referred to PHC for oral glucose tolerance test. IFA tablets given. Next follow-up in 2 weeks.',
      author: 'Rekha Singh (ASHA)',
    },
    {
      date: '2026-09-20',
      text: 'Regular ANC checkup. Everything normal. Maternal weight 68.5kg. FHS audible and normal.',
      author: 'Rekha Singh (ASHA)',
    },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('Rekha Singh (ASHA)');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatientNotes(patientId)
      .then((data: NoteItem[]) => {
        if (Array.isArray(data) && data.length > 0) setNotes(data);
      })
      .catch(() => undefined);
  }, [patientId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    const today = new Date().toISOString().slice(0, 10);
    try {
      const updated = await addPatientNoteApi(patientId, {
        text: text.trim(),
        author: author.trim(),
        date: today,
      });
      if (Array.isArray(updated)) setNotes(updated);
      else {
        setNotes((prev) => [{ date: today, text: text.trim(), author: author.trim() }, ...prev]);
      }
      setText('');
      setShowAdd(false);
    } catch {
      setNotes((prev) => [{ date: today, text: text.trim(), author: author.trim() }, ...prev]);
      setShowAdd(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h4 className="font-display font-bold text-slate-800 text-sm">ASHA Clinical Notes</h4>
          <p className="text-xs text-slate-400">Field observations and referral logs</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Note
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-3.5 rounded-xl border border-primary-200 bg-primary-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Add New Clinical Note</span>
            <button type="button" onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type clinical observations, counseling notes, or referral instructions..."
            rows={3}
            required
            className="w-full p-2.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-primary-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="text-[11px] px-2 py-1 rounded border border-slate-200 bg-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1 rounded-lg bg-primary-600 text-white text-xs font-semibold shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {notes.map((note, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-sm space-y-2 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {note.date}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {note.author}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {note.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
