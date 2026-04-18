'use client';

import { useState, useCallback } from 'react';
import { Movement } from '@/types/workout';

interface Props {
  movement: Movement;
  sessionKey: string;
}

function getSessionState(key: string) {
  if (typeof window === 'undefined') return { checks: {}, notes: {} };
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
}

function saveSessionState(key: string, state: object) {
  localStorage.setItem(key, JSON.stringify(state));
}

const PRESET_NOTES = ['Too Easy', 'Too Hard', 'Reduced Load', 'Increased Reps', 'Skipped'];

export default function MovementRow({ movement, sessionKey }: Props) {
  const [checked, setChecked] = useState(() => {
    const s = getSessionState(sessionKey);
    return !!(s.checks?.[movement.id]);
  });

  const [note, setNote] = useState<string>(() => {
    const s = getSessionState(sessionKey);
    return s.notes?.[movement.id] ?? '';
  });

  const [notesOpen, setNotesOpen] = useState(false);

  const toggleCheck = useCallback(() => {
    setChecked((prev) => {
      const next = !prev;
      const s = getSessionState(sessionKey);
      s.checks = { ...(s.checks ?? {}), [movement.id]: next };
      saveSessionState(sessionKey, s);
      return next;
    });
  }, [sessionKey, movement.id]);

  const saveNote = useCallback((text: string) => {
    setNote(text);
    const s = getSessionState(sessionKey);
    s.notes = { ...(s.notes ?? {}), [movement.id]: text };
    saveSessionState(sessionKey, s);
  }, [sessionKey, movement.id]);

  const appendPreset = (preset: string) => {
    const next = note ? `${note}, ${preset}` : preset;
    saveNote(next);
  };

  // Build the detail line
  const details = [
    movement.sets ? `${movement.sets} sets` : null,
    movement.reps ? `× ${movement.reps}` : null,
    movement.weight ? `@ ${movement.weight}` : null,
  ]
    .filter(Boolean)
    .join(' ');

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

        {/* Movement info */}
        <div className={['flex-1 min-w-0', checked ? 'opacity-50' : ''].join(' ')}>
          <div className="text-white font-medium text-base leading-tight">{movement.name}</div>
          {details && (
            <div className="text-gray-400 text-sm mt-0.5">{details}</div>
          )}
          {movement.note && (
            <div className="text-gray-500 text-xs mt-0.5 italic">{movement.note}</div>
          )}
        </div>

        {/* Notes toggle */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className={[
            'w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0',
            note ? 'text-yellow-400' : 'text-gray-600 active:text-gray-300',
          ].join(' ')}
          aria-label="Add note"
        >
          {note ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 4h16v12H4zM4 18l4-2h12v2z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7m-7 4h4M5 4h14a1 1 0 011 1v11l-4 4H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
            </svg>
          )}
        </button>
      </div>

      {/* Notes panel */}
      {notesOpen && (
        <div className="px-4 pb-3 pt-1 border-t border-gray-700/60 bg-gray-900/50">
          {/* Preset tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {PRESET_NOTES.map((p) => (
              <button
                key={p}
                onClick={() => appendPreset(p)}
                className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 active:bg-gray-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          {/* Free text */}
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
