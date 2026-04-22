'use client';

import { useState } from 'react';
import { Movement } from '@/types/workout';
import MovementMedia from './MovementMedia';

interface Props {
  movement: Movement;
  rowId: string;
  user: string;
  checked: boolean;
  note: string;
  result: string;
  active?: boolean;
  setLabel?: string;  // e.g. "Set 2 / 4" or "Minute 3"
  onCheck: (rowId: string, value: boolean) => void;
  onNote: (rowId: string, value: string) => void;
  onResult: (rowId: string, value: string) => void;
}

const PRESETS = ['Too Easy', 'Too Hard', 'Reduced Load', 'Increased Reps', 'Skipped'];

export default function MovementRow({
  movement, rowId, user, checked, note, result, active = false, setLabel, onCheck, onNote, onResult,
}: Props) {
  const [notesOpen, setNotesOpen] = useState(false);

  // When expanded by set, hide the "N sets" prefix — it's shown in setLabel instead
  const details = [
    !setLabel && movement.sets ? `${movement.sets} sets` : null,
    movement.reps ? `× ${movement.reps}` : null,
    movement.weight ? `@ ${movement.weight}` : null,
  ].filter(Boolean).join(' ');

  return (
    <div>
      <div className={[
        'flex items-center px-4 py-4 gap-3 transition-colors',
        active ? 'bg-fuchsia-500/10' : '',
      ].join(' ')}>
        {/* Checkbox */}
        <button
          onClick={() => onCheck(rowId, !checked)}
          className={[
            'w-9 h-9 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
            checked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-500 bg-transparent active:border-gray-300',
          ].join(' ')}
          aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
        >
          {checked && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Exercise image */}
        <MovementMedia
          key={`${user}:${movement.name}`}
          user={user}
          movementName={movement.name}
          media={movement.media}
        />

        {/* Movement info */}
        <div className={['flex-1 min-w-0', checked ? 'opacity-40' : ''].join(' ')}>
          {setLabel && (
            <div className={[
              'text-xs font-semibold uppercase tracking-widest mb-0.5',
              active ? 'text-fuchsia-200' : 'text-gray-500',
            ].join(' ')}>
              {setLabel}
            </div>
          )}
          <div className="text-white font-semibold text-xl leading-tight">{movement.name}</div>
          {details && <div className="text-gray-400 text-base mt-0.5">{details}</div>}
          {movement.note && <div className="text-gray-500 text-sm mt-0.5 italic">{movement.note}</div>}
        </div>

        {/* Result input (if trackResult enabled) */}
        {movement.trackResult && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              type="number"
              inputMode="numeric"
              value={result}
              onChange={(e) => onResult(rowId, e.target.value)}
              placeholder="—"
              className="w-14 bg-gray-700 text-white text-center text-base rounded-lg px-2 py-1.5 border border-gray-600 focus:outline-none focus:border-gray-400"
            />
            {movement.unit && (
              <span className="text-gray-500 text-sm">{movement.unit}</span>
            )}
          </div>
        )}

        {/* Notes icon */}
        <button
          onClick={() => setNotesOpen((o) => !o)}
          className={[
            'w-9 h-9 flex items-center justify-center rounded-lg transition-colors flex-shrink-0',
            note ? 'text-yellow-400' : 'text-gray-600 active:text-gray-300',
          ].join(' ')}
          aria-label="Notes"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={note ? 2 : 1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h7m-7 4h4M5 4h14a1 1 0 011 1v11l-4 4H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
          </svg>
          {note && <span className="absolute w-2 h-2 bg-yellow-400 rounded-full top-0.5 right-0.5" />}
        </button>
      </div>

      {notesOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-700/60 bg-gray-900/50">
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => onNote(rowId, note ? `${note}, ${p}` : p)}
                className="text-sm px-3 py-1.5 rounded-full bg-gray-700 text-gray-300 active:bg-gray-600 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => onNote(rowId, e.target.value)}
            placeholder="Add a note…"
            rows={2}
            className="w-full bg-gray-800 text-white text-base rounded-lg px-3 py-2 placeholder-gray-600 border border-gray-700 focus:outline-none focus:border-gray-500 resize-none"
          />
        </div>
      )}
    </div>
  );
}
