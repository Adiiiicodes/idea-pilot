'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';

export default function ClientAuthChecker() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side before using router
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Check if user is already authenticated
  useEffect(() => {
    if (!isClient) return; // Don't run on server side
    
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        // If authenticated, redirect to dashboard
        if (user && !error) {
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };
    
    checkAuth();
  }, [router, isClient]);
  
  // This component is only used for client-side auth checking
  // The actual homepage content is rendered server-side
  return null;
}