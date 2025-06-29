'use client';

import { useState } from 'react';
import { signIn, signUp, AuthResponse } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setIsNewUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response: AuthResponse;
      
      if (isLogin) {
        // Handle login
        response = await signIn(email, password);
        // For login, user is not new
        setIsNewUser(false);
      } else {
        // Handle sign up
        response = await signUp(email, password, fullName);
        // For signup, mark as new user - this will be handled by the auth state change
        console.log('Signup response:', response);
      }
      
      if (response.error) {
        setError(response.error.message);
      } else if (response.data?.user) {
        // Check if email confirmation is required based on session presence
        if (!response.data.session && !isLogin) {
          setError('Please check your email to confirm your account before logging in');
        } else {
          // Successful login/signup with session
          router.push('/dashboard');
        }
      }
    } catch (err: unknown) {
      setError(
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message?: string }).message)
          : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="w-full max-w-md p-8 space-y-8 bg-dark-card rounded-lg shadow-xl border border-dark-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-dark-text">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h1>
          <p className="mt-2 text-dark-text-secondary">
            {isLogin 
              ? 'Welcome back to IdeaPilot'
              : 'Start your journey with IdeaPilot AI'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-dark-text">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required={!isLogin}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark-text">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-text">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-dark-element border border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-primary-purple focus:border-primary-purple"
            />
          </div>
          
          {error && (
            <div className="text-badge-red text-sm p-2 bg-dark-element/50 rounded-md">
              {error}
            </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-purple hover:bg-primary-purple/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary-blue hover:text-primary-purple cursor-pointer text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}