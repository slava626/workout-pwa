'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface TimerControls {
  elapsed: number;      // ms
  running: boolean;
  started: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;  // reset elapsed to 0, resume, keep started=true
}

export function useTimer(): TimerControls {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);

  const startedAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const base = startedAtRef.current ?? Date.now();
      setElapsed(accumulatedRef.current + (Date.now() - base));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    startedAtRef.current = Date.now();
    setStarted(true);
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (startedAtRef.current) {
      accumulatedRef.current += Date.now() - startedAtRef.current;
      startedAtRef.current = null;
    }
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    startedAtRef.current = Date.now();
    setRunning(true);
  }, []);

  const restart = useCallback(() => {
    accumulatedRef.current = 0;
    startedAtRef.current = Date.now();
    setElapsed(0);
    setRunning(true);
    // started stays true — workout remains in progress
  }, []);

  return { elapsed, running, started, start, pause, resume, restart };
}

export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}
