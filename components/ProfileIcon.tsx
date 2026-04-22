import { UserName } from '@/types/workout';

interface Props {
  user: UserName;
  className?: string;
}

export default function ProfileIcon({ user, className = 'w-6 h-6' }: Props) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (user === 'stone') {
    return (
      <svg {...common}>
        <path d="M4 16c2.5-3.5 6.2-5.2 11-5" />
        <path d="M3 19c3-1.2 6.3-1.8 10-1.8 3.2 0 5.8.4 8 1.3" />
        <path d="M8 12c1-2.7 3-4.8 6-6" />
        <path d="M14.5 5.2c2.4.3 4.1 1.6 5.3 3.8" />
        <path d="M9 9.5c1.7.7 3.5.9 5.3.6" />
      </svg>
    );
  }

  if (user === 'lightning') {
    return (
      <svg {...common}>
        <path d="M13.5 2 6 13h4l-1.5 9L18 10h-4.5L13.5 2Z" />
      </svg>
    );
  }

  if (user === 'ice') {
    return (
      <svg {...common}>
        <path d="M12 2v20" />
        <path d="m5 6 14 12" />
        <path d="M19 6 5 18" />
        <path d="m12 2 2 2" />
        <path d="m12 2-2 2" />
        <path d="m12 22 2-2" />
        <path d="m12 22-2-2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 21c4-2.2 7-6.1 7-10.8C19 6.2 15.9 3 12 3S5 6.2 5 10.2C5 14.9 8 18.8 12 21Z" />
      <path d="M12 20V11" />
      <path d="M12 12c0-2.2 1.7-3.7 3.8-4.4" />
      <path d="M12 14c0-1.6-1.1-3-2.8-4" />
      <path d="M12 10c-.8-1.2-2.1-2-3.8-2.3" />
    </svg>
  );
}
