import { UserName } from '@/types/workout';
import WorkoutPage from '@/components/WorkoutPage';

export function generateStaticParams() {
  return [
    { user: 'stone' },
    { user: 'lightning' },
    { user: 'ice' },
    { user: 'genesis' },
  ];
}

export default async function Page({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  return <WorkoutPage user={user as UserName} />;
}
