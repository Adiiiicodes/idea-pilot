'use client';

import React, { useState } from 'react';
import { ResourceService } from '@/services/resourceService';
import { EnhancedResource } from '@/types/resource';

interface ResourceProcessorProps {
  urls: string[];
  projectContext: any;
  projectId?: string;
  onProcessingComplete?: (resources: EnhancedResource[]) => void;
  onError?: (error: string) => void;
}

export const ResourceProcessor: React.FC<ResourceProcessorProps> = ({
  urls,
  projectContext,
  projectId,
  onProcessingComplete,
  onError
}) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    currentUrl?: string;
    status: 'scraping' | 'processing' | 'complete' | 'error';
  }>({
    current: 0,
    total: urls.length,
    status: 'scraping'
  });

  const processResources = async () => {
    setProcessing(true);
    setProgress({ current: 0, total: urls.length, status: 'scraping' });

    try {
      // Simulate progress updates (in real implementation, you might want to process URLs one by one)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev.current < prev.total) {
            return {
              ...prev,
              current: prev.current + 1,
              currentUrl: urls[prev.current],
              status: prev.current < prev.total - 1 ? 'scraping' : 'processing'
            };
          }
          return prev;
        });
      }, 2000);

      const result = await ResourceService.processResources(urls, projectContext, projectId);
      
      clearInterval(progressInterval);
      setProgress({ current: urls.length, total: urls.length, status: 'complete' });
      
      if (onProcessingComplete) {
        onProcessingComplete(result.enhanced_resources);
      }
    } catch (error) {
      setProgress(prev => ({ ...prev, status: 'error' }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to process resources';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'scraping':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-blue animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'processing':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-yellow animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'complete':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-secondary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-badge-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-dark-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'scraping':
        return 'Scraping web content...';
      case 'processing':
        return 'Processing with AI...';
      case 'complete':
        return 'Processing complete!';
      case 'error':
        return 'Processing failed';
      default:
        return 'Ready to process';
    }
  };

  if (!processing && progress.status !== 'complete' && progress.status !== 'error') {
    return (
      <div className="bg-primary-blue bg-opacity-10 border border-primary-blue border-opacity-30 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-primary-blue font-cabin">Enhance Resources</h3>
            <p className="text-sm text-primary-blue font-source">
              Process {urls.length} resource{urls.length !== 1 ? 's' : ''} with AI to create enhanced learning materials
            </p>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {urls.slice(0, 3).map((url, index) => (
            <div key={index} className="text-sm text-primary-blue bg-primary-blue bg-opacity-10 rounded px-3 py-2 font-source">
              {url}
            </div>
          ))}
          {urls.length > 3 && (
            <div className="text-sm text-primary-blue font-source">
              +{urls.length - 3} more resource{urls.length - 3 !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <button
          onClick={processResources}
          className="bg-primary-blue text-dark-text px-4 py-2 rounded-lg hover:bg-primary-purple transition-colors font-medium font-cabin"
        >
          Start Processing
        </button>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {getStatusIcon()}
        <div>
          <h3 className="font-medium text-dark-text font-cabin">{getStatusText()}</h3>
          {progress.currentUrl && (
            <p className="text-sm text-dark-text-secondary font-source">
              Current: {progress.currentUrl}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-dark-text-secondary mb-2">
          <span>Progress</span>
          <span>{progress.current} / {progress.total}</span>
        </div>
        <div className="w-full bg-dark-element rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              progress.status === 'error' ? 'bg-badge-red' : 
              progress.status === 'complete' ? 'bg-secondary-green' : 'bg-primary-blue'
            }`}
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {progress.status === 'complete' && (
        <div className="bg-secondary-green bg-opacity-10 border border-secondary-green border-opacity-30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-secondary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-secondary-green font-medium font-cabin">
              Successfully processed {progress.total} resource{progress.total !== 1 ? 's' : ''}!
            </span>
          </div>
          <p className="text-secondary-green text-sm mt-1 font-source">
            Enhanced resources are now available with AI-generated summaries, learning objectives, and mentor integration.
          </p>
        </div>
      )}

      {progress.status === 'error' && (
        <div className="bg-badge-red bg-opacity-10 border border-badge-red border-opacity-30 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-badge-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-badge-red font-medium font-cabin">Processing failed</span>
          </div>
          <p className="text-badge-red text-sm mt-1 font-source">
            Some resources couldn't be processed. You can try again or contact support.
          </p>
        </div>
      )}
    </div>
  );
};