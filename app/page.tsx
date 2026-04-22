import Link from 'next/link';
import ProfileIcon from '@/components/ProfileIcon';
import { PROFILE_META } from '@/lib/profiles';

const USERS = Object.values(PROFILE_META);

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
            className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-gray-800 active:bg-gray-700 transition-colors border border-gray-700"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-100">
              <ProfileIcon user={u.id} className="w-7 h-7" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-2xl font-semibold text-white">{u.label}</span>
              <span className="text-sm text-gray-400 mt-0.5">{u.sub}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
