'use client';

import { useState, useCallback } from 'react';
import { Movement } from '@/types/workout';

interface Props {
  movement: Movement;
  rowId: string;       // unique per round (e.g. "wod-1-r2")
  sessionKey: string;
}

function getSession(key: string): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(key) ?? '{}'); } catch { return {}; }
}

function saveSession(key: string, state: Record<string, unknown>) {
  localStorage.setItem(key, JSON.stringify(state));
}

const PRESETS = ['Too Easy', 'Too Hard', 'Reduced Load', 'Increased Reps', 'Skipped'];

export default function MovementRow({ movement, rowId, sessionKey }: Props) {
  const [checked, setChecked] = useState(() => {
    const s = getSession(sessionKey);
    return !!(s.checks as Record<string, boolean> | undefined)?.[rowId];
  });

  const [note, setNote] = useState<string>(() => {
    const s = getSession(sessionKey);
    return (s.notes as Record<string, string> | undefined)?.[rowId] ?? '';
  });

  const [notesOpen, setNotesOpen] = useState(false);

  const toggleCheck = useCallback(() => {
    setChecked((prev) => {
      const next = !prev;
      const s = getSession(sessionKey);
      const checks = (s.checks as Record<string, boolean> | undefined) ?? {};
      checks[rowId] = next;
      s.checks = checks;
      saveSession(sessionKey, s);
      return next;
    });
  }, [sessionKey, rowId]);

  const saveNote = useCallback((text: string) => {
    setNote(text);
    const s = getSession(sessionKey);
    const notes = (s.notes as Record<string, string> | undefined) ?? {};
    notes[rowId] = text;
    s.notes = notes;
    saveSession(sessionKey, s);
  }, [sessionKey, rowId]);

  const details = [
    movement.sets ? `${movement.sets} sets` : null,
    movement.reps ? `× ${movement.reps}` : null,
    movement.weight ? `@ ${movement.weight}` : null,
  ].filter(Boolean).join(' ');

  return (
    <div>
      <div className="flex items-center px-4 py-3 gap-3">
        {/* Checkbox */}
        <button
          onClick={toggleCheck}
          className={[
            'w-7 h-7 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
            checked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-500 bg-transparent active:border-gray-300',
          ].join(' ')}
          aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
        >
          {checked && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Info */}
        <div className={['flex-1 min-w-0', checked ? 'opacity-40' : ''].join(' ')}>
          <div className="text-white font-medium text-base leading-tight">{movement.name}</div>
          {details && <div className="text-gray-400 text-sm mt-0.5">{details}</div>}
          {movement.note && <div className="text-gray-500 text-xs mt-0.5 italic">{movement.note}</div>}
        </div>

        {/* Notes icon */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className={['w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0', note ? 'text-yellow-400' : 'text-gray-600 active:text-gray-300'].join(' ')}
          aria-label="Notes"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={note ? 0 : 1.5}>
            {note
              ? <path fill="currentColor" d="M4 4h16v12H4zM4 18l4-2h12v2z" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7m-7 4h4M5 4h14a1 1 0 011 1v11l-4 4H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
            }
          </svg>
        </button>
      </div>

      {notesOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-700/60 bg-gray-900/50">
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => saveNote(note ? `${note}, ${p}` : p)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 active:bg-gray-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => saveNote(e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 placeholder-gray-600 border border-gray-700 focus:outline-none focus:border-gray-500 resize-none"
          />
        </div>
      )}
    </div>
  );
}
