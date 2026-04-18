import Link from 'next/link';

const USERS = [
  { id: 'stone', label: 'Stone', sub: 'Strength & Power' },
  { id: 'lightning', label: 'Lightning', sub: 'Speed & Conditioning' },
  { id: 'ice', label: 'Ice', sub: 'Mobility & Stability' },
] as const;

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-full px-6 py-16 gap-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">Workout</h1>
        <p className="mt-2 text-gray-400 text-sm">Select your profile</p>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-4">
        {USERS.map((u) => (
          <Link
            key={u.id}
            href={`/${u.id}`}
            className="flex flex-col items-start px-6 py-5 rounded-2xl bg-gray-800 active:bg-gray-700 transition-colors border border-gray-700"
          >
            <span className="text-2xl font-semibold text-white">{u.label}</span>
            <span className="text-sm text-gray-400 mt-0.5">{u.sub}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
