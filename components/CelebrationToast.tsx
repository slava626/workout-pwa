'use client';

import { useEffect, useState } from 'react';

interface Props {
  trigger: number; // increment to fire
}

const CONFETTI = [
  { color: '#f87171', left: '15%' },
  { color: '#60a5fa', left: '25%' },
  { color: '#fbbf24', left: '38%' },
  { color: '#34d399', left: '50%' },
  { color: '#a78bfa', left: '62%' },
  { color: '#f472b6', left: '75%' },
  { color: '#fb923c', left: '85%' },
];

const MESSAGES = ['Keep going!', 'Nice work!', 'Crushing it!', 'Let\'s go!', 'Beast mode!'];

export default function CelebrationToast({ trigger }: Props) {
  const [visible, setVisible] = useState(false);
  const [msg] = useState(() => MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);

  useEffect(() => {
    if (trigger === 0) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-1/3 z-50 pointer-events-none flex flex-col items-center gap-4">
      {/* Confetti dots */}
      <div className="absolute inset-x-0 top-0">
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className="animate-confetti absolute w-3 h-3 rounded-sm"
            style={{
              backgroundColor: c.color,
              left: c.left,
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>

      {/* Toast */}
      <div className="animate-celebrate bg-white text-gray-900 px-8 py-3 rounded-2xl font-bold text-xl shadow-2xl">
        💪 {msg}
      </div>
    </div>
  );
}
