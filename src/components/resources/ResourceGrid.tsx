'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedResource } from '@/types/resource';
import { EnhancedResourceCard } from './EnhancedResourceCard';
import { ResourceService } from '@/services/resourceService';

interface ResourceGridProps {
  projectId?: string;
  resources?: EnhancedResource[];
  onAskMentor?: (question: string) => void;
  className?: string;
}

export const ResourceGrid: React.FC<ResourceGridProps> = ({
  projectId,
  resources: initialResources,
  onAskMentor,
  className = ''
}) => {
  const [resources, setResources] = useState<EnhancedResource[]>(initialResources || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Load resources if projectId provided and no initial resources
  useEffect(() => {
    if (projectId && !initialResources) {
      loadResources();
    }
  }, [projectId, initialResources]);

  const loadResources = async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const loadedResources = await ResourceService.getEnhancedResources(projectId);
      setResources(loadedResources);
    } catch (err) {
      setError('Failed to load resources');
      console.error('Error loading resources:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter resources based on search and difficulty
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.enhanced_resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.enhanced_resource.overview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || 
      resource.enhanced_resource.difficulty_level.toLowerCase() === difficultyFilter.toLowerCase();

    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <span className="ml-3 text-dark-text-secondary">Loading enhanced resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-badge-red bg-opacity-10 border border-badge-red border-opacity-30 rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-badge-red mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-badge-red mb-2 font-cabin">Error Loading Resources</h3>
          <p className="text-badge-red mb-4 font-source">{error}</p>
          <button
            onClick={loadResources}
            className="bg-badge-red text-dark-text px-4 py-2 rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-medium text-dark-text mb-2 font-cabin">No Enhanced Resources Yet</h3>
          <p className="text-dark-text-secondary font-source">
            Enhanced resources will appear here once they're processed from the project links.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header with Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark-text mb-1 font-cabin">Enhanced Resources</h2>
            <p className="text-dark-text-secondary font-source">
              AI-processed learning materials tailored for your project
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-dark-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent w-full sm:w-64 bg-dark-element text-dark-text"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-dark-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent appearance-none bg-dark-element text-dark-text"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-dark-text-secondary">
          Showing {filteredResources.length} of {resources.length} resources
        </div>
      </div>

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-dark-text-secondary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-dark-text mb-2 font-cabin">No Resources Found</h3>
          <p className="text-dark-text-secondary font-source">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:gap-8">
          {filteredResources.map((resource, index) => (
            <EnhancedResourceCard
              key={resource.id || index}
              resource={resource}
              onAskMentor={onAskMentor}
            />
          ))}
        </div>
      )}
    </div>
  );
};