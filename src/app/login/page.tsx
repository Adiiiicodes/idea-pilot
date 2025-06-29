// Force this page to be dynamic to avoid SSG issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import LoginPage from '@/components/LoginPage';

export default function Login() {
  return <LoginPage />;
}