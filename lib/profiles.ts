import { UserName } from '@/types/workout';

export interface ProfileMeta {
  id: UserName;
  label: string;
  sub: string;
}

export const PROFILE_META: Record<UserName, ProfileMeta> = {
  stone: {
    id: 'stone',
    label: 'Sandstorm',
    sub: 'Strength & Power',
  },
  lightning: {
    id: 'lightning',
    label: 'Lightning',
    sub: 'Speed & Conditioning',
  },
  ice: {
    id: 'ice',
    label: 'Ice',
    sub: 'Mobility & Stability',
  },
  genesis: {
    id: 'genesis',
    label: 'Genesis',
    sub: 'Foundation & Movement',
  },
};

export function getProfileMeta(user: string): ProfileMeta {
  return PROFILE_META[user as UserName] ?? {
    id: user as UserName,
    label: user,
    sub: '',
  };
}
