import { Metadata } from 'next';
import ClientHomePage from '@/components/ClientHomePage';

// Force this page to be dynamic to avoid SSG issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Idea Pilot - AI Project Generator',
  description: 'Generate personalized project ideas and get mentorship through a structured roadmap',
};

export default function HomePage() {
  return <ClientHomePage />;
}