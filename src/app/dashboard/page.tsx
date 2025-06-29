// Force this page to be dynamic to avoid SSG issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  return <Dashboard />;
}