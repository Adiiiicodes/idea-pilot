// src/components/ProjectGeneratorForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import { ProjectResponse, DomainMismatchData, ProjectFormData } from '@/types/project';
import DomainMismatchModal from './DomainMismatchModal';

// Define the props interface properly
interface ProjectGeneratorFormProps {
  onProjectGenerated: (projectData: ProjectResponse, experienceLevel: number) => void;
}

export default function ProjectGeneratorForm({ onProjectGenerated }: ProjectGeneratorFormProps) {
  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    conceptText: '',
    experienceLevel: 2,
    domain: 'coding'
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for domain mismatch
  const [showDomainMismatch, setShowDomainMismatch] = useState(false);
  const [domainMismatchData, setDomainMismatchData] = useState<DomainMismatchData | null>(null);
  
  // Updated project generation function
  const generateProject = async (data: ProjectFormData = formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Sending request to generate project with data:', data);
      
      // Use local API endpoint instead of direct backend URL
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conceptText: data.conceptText,
          experienceLevel: data.experienceLevel,
          domain: data.domain
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Get response text first to see what we're dealing with
      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 500));
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
      
      console.log('Parsed response data:', responseData);
      
      if (!response.ok) {
        // Check if it's a concept-domain mismatch (feature, not error)
        if (responseData.error === 'concept_domain_mismatch') {
          console.log('Domain mismatch detected, showing modal');
          setShowDomainMismatch(true);
          setDomainMismatchData(responseData);
          return;
        } else {
          // Handle as actual error
          const errorMessage = responseData.error || responseData.details || `Server error: ${response.status}`;
          console.error('API error:', errorMessage);
          throw new Error(errorMessage);
        }
      }
      
      // Validate response structure
      if (!responseData.project || !responseData.project.title) {
        console.error('Invalid project data structure:', responseData);
        throw new Error('Invalid project data received from server');
      }
      
      // Success case
      const projectData: ProjectResponse = responseData;
      console.log('Successfully generated project:', projectData.project.title);
      
      // Pass the data to parent component
      onProjectGenerated(projectData, data.experienceLevel);
      
      // Reset mismatch state on success
      setShowDomainMismatch(false);
      setDomainMismatchData(null);
      
    } catch (error) {
      console.error('Error generating project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    generateProject();
  };

  // Handler for switching domain
  const handleSwitchDomain = (suggestedDomain: string) => {
    const updatedFormData = { ...formData, domain: suggestedDomain };
    setFormData(updatedFormData);
    setShowDomainMismatch(false);
    
    // Auto-regenerate with new domain
    generateProject(updatedFormData);
  };

  // Handler for modifying concept
  const handleModifyConcept = () => {
    setShowDomainMismatch(false);
    // Focus on concept input field
    const conceptInput = document.getElementById('concept') as HTMLTextAreaElement;
    conceptInput?.focus();
  };

  // Handler for closing modal
  const handleCloseMismatch = () => {
    setShowDomainMismatch(false);
    setDomainMismatchData(null);
  };
  
  return (
    <>
      <div className="bg-dark-card rounded-lg shadow-md border border-dark-border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-primary-purple to-primary-blue text-dark-text">
          <h2 className="text-xl font-bold font-cabin">Generate Project Idea</h2>
        </div>
        
        <form className="p-6" onSubmit={handleSubmit}>
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-badge-red bg-opacity-10 border border-badge-red border-opacity-30 rounded-lg">
              <div className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-badge-red mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="font-medium text-badge-red mb-1 font-cabin">Error Generating Project</h4>
                  <p className="text-badge-red text-sm font-source">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="mt-2 text-xs text-badge-red hover:text-badge-red underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="concept" className="block text-dark-text font-cabin font-medium mb-2">
              Concept or Learning Goal
            </label>
            <textarea
              id="concept"
              name="concept"
              value={formData.conceptText}
              onChange={(e) => setFormData({ ...formData, conceptText: e.target.value })}
              required
              placeholder="Describe what you want to learn or build, e.g., 'A web app that helps track habits' or 'Learn TensorFlow by building something'"
              className="w-full p-3 bg-dark-element border border-dark-border rounded-md text-dark-text font-source focus:outline-none focus:ring-2 focus:ring-primary-purple resize-none min-h-[120px]"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label htmlFor="experience" className="block text-dark-text font-cabin font-medium mb-2">
              Experience Level
            </label>
            <div className="flex flex-col">
              <input
                id="experience"
                name="experience"
                type="range"
                min="1"
                max="3"
                step="1"
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: parseInt(e.target.value) })}
                className="w-full accent-primary-purple mb-2"
              />
              <div className="flex justify-between text-sm text-dark-text-secondary">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-dark-text font-cabin font-medium mb-2">
              Project Domain
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['coding', 'hardware', 'design', 'research'].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setFormData({ ...formData, domain: area })}
                  className={`p-3 rounded-md border ${
                    formData.domain === area
                      ? 'bg-primary-purple border-primary-purple text-dark-text'
                      : 'bg-dark-element border-dark-border text-dark-text-secondary hover:border-primary-purple'
                  } transition-colors flex items-center justify-center`}
                >
                  <span className="text-sm font-medium capitalize font-source">{area}</span>
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.conceptText.trim()}
            className={`w-full py-3 rounded-md font-bold font-cabin text-dark-text transition-all duration-200 ${
              isSubmitting || !formData.conceptText.trim()
                ? 'bg-dark-element cursor-not-allowed opacity-70'
                : 'bg-primary-purple hover:bg-accent-pink hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </div>
            ) : (
              'Generate Project Idea'
            )}
          </button>
        </form>
      </div>

      {/* Domain Mismatch Modal */}
      {showDomainMismatch && domainMismatchData && (
        <DomainMismatchModal
          data={domainMismatchData}
          onSwitchDomain={handleSwitchDomain}
          onModifyConcept={handleModifyConcept}
          onClose={handleCloseMismatch}
        />
      )}
    </>
  );
}