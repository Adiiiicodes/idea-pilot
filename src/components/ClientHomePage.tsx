'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/supabase';

export default function ClientHomePage() {
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
  
  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-purple"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card shadow-md border-b border-dark-border">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-8 h-8 mr-3"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
            <h1 className="text-2xl font-bold text-dark-text font-cabin">Idea Pilot</h1>
          </div>
          
          <div className="space-x-4">
            <Link
              href="/login"
              className="px-4 py-2 bg-dark-element text-dark-text rounded-md hover:bg-dark-border transition-colors font-cabin"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-primary-purple text-dark-text rounded-md hover:bg-accent-pink transition-colors font-cabin"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-dark-text font-cabin mb-6 leading-tight">
                Generate Personalized Projects with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-purple to-primary-blue">AI Mentorship</span>
              </h2>
              <p className="text-dark-text-secondary font-source text-lg mb-8">
                Idea Pilot helps students, career switchers, and hobbyists apply new concepts through hands-on projects with structured roadmaps and real-time AI mentoring.
              </p>
              <Link
                href="/login"
                className="inline-block px-8 py-4 bg-accent-pink text-dark-text rounded-md font-cabin font-bold text-lg hover:scale-105 transition-all duration-200 hover:bg-primary-purple"
              >
                Get Started Free
              </Link>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-purple to-primary-blue opacity-10 rounded-lg"></div>
                <div className="relative bg-dark-card border border-dark-border rounded-lg shadow-xl overflow-hidden">
                  <div className="p-4 bg-dark-element border-b border-dark-border">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div className="ml-4 text-dark-text-secondary font-mono text-xs">idea-pilot.app</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="h-8 bg-dark-element rounded w-3/4"></div>
                      <div className="h-32 bg-dark-element rounded w-full"></div>
                      <div className="h-8 bg-accent-pink rounded w-full"></div>
                      <div className="flex gap-3">
                        <div className="h-12 bg-dark-element rounded w-1/4"></div>
                        <div className="h-12 bg-dark-element rounded w-1/4"></div>
                        <div className="h-12 bg-dark-element rounded w-1/4"></div>
                        <div className="h-12 bg-dark-element rounded w-1/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-dark-card">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-dark-text font-cabin mb-12 text-center">
            How Idea Pilot Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-dark-bg rounded-lg p-6 border border-dark-border shadow-md">
              <div className="w-12 h-12 bg-primary-purple rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-text font-cabin mb-3">
                1. Generate Project Ideas
              </h3>
              <p className="text-dark-text-secondary font-source">
                Enter a concept or paste a lecture transcript, set your experience level, and choose your area of interest to generate personalized project ideas.
              </p>
            </div>
            
            <div className="bg-dark-bg rounded-lg p-6 border border-dark-border shadow-md">
              <div className="w-12 h-12 bg-secondary-green rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-text font-cabin mb-3">
                2. Follow Structured Roadmaps
              </h3>
              <p className="text-dark-text-secondary font-source">
                Get detailed milestones, resource links, and starter code to guide you through your project from start to finish.
              </p>
            </div>
            
            <div className="bg-dark-bg rounded-lg p-6 border border-dark-border shadow-md">
              <div className="w-12 h-12 bg-accent-pink rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark-text font-cabin mb-3">
                3. Get AI Mentorship
              </h3>
              <p className="text-dark-text-secondary font-source">
                Chat with your AI mentor for real-time guidance, debugging help, and encouragement as you build your project.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-dark-text font-cabin mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-dark-text-secondary font-source text-lg mb-8 max-w-xl mx-auto">
            Join thousands of learners who are turning concepts into real projects with Idea Pilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-dark-element text-dark-text rounded-md font-cabin font-bold hover:bg-dark-border transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-accent-pink text-dark-text rounded-md font-cabin font-bold hover:scale-105 transition-all duration-200 hover:bg-primary-purple"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-dark-card border-t border-dark-border">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#6366F1" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-6 h-6 mr-2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-dark-text font-cabin">
                Idea Pilot © {new Date().getFullYear()}
              </span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                About
              </a>
              <a href="#" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Privacy
              </a>
              <a href="#" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Terms
              </a>
              <a href="#" className="text-dark-text-secondary hover:text-dark-text transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}