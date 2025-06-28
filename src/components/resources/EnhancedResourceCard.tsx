'use client';

import React, { useState } from 'react';
import { EnhancedResource } from '@/types/resource';

interface EnhancedResourceCardProps {
  resource: EnhancedResource;
  onAskMentor?: (question: string) => void;
  className?: string;
}

export const EnhancedResourceCard: React.FC<EnhancedResourceCardProps> = ({
  resource,
  onAskMentor,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const { enhanced_resource: data, mentor_context } = resource;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-secondary-green bg-opacity-20 text-secondary-green border-secondary-green border-opacity-30';
      case 'Intermediate': return 'bg-secondary-orange bg-opacity-20 text-secondary-orange border-secondary-orange border-opacity-30';
      case 'Advanced': return 'bg-badge-red bg-opacity-20 text-badge-red border-badge-red border-opacity-30';
      default: return 'bg-dark-element text-dark-text-secondary border-dark-border';
    }
  };

  const handleAskMentor = (question: string) => {
    if (onAskMentor) {
      onAskMentor(`Regarding the resource "${data.title}": ${question}`);
    }
  };

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'objectives', label: 'Learning Objectives' },
    { id: 'concepts', label: 'Key Concepts' },
    { id: 'applications', label: 'Practical Applications' },
    { id: 'pitfalls', label: 'Common Pitfalls' },
    { id: 'next-steps', label: 'Next Steps' }
  ];

  return (
    <div className={`bg-dark-card rounded-xl shadow-lg border border-dark-border overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark-text mb-2 leading-tight font-cabin">
              {data.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-dark-text-secondary">
              <span className={`px-3 py-1 rounded-full border text-xs font-medium ${getDifficultyColor(data.difficulty_level)}`}>
                {data.difficulty_level}
              </span>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{data.estimated_reading_time}</span>
              </div>
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{data.word_count} words</span>
              </div>
            </div>
          </div>
          <a
            href={data.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary-blue hover:text-primary-purple text-sm font-medium transition-colors"
          >
            <span>Source</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Quick Overview */}
        <p className="text-dark-text leading-relaxed mb-4 font-source">
          {data.overview.substring(0, 200)}...
        </p>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-primary-blue hover:text-primary-purple font-medium transition-colors"
        >
          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-b border-dark-border">
          {/* Section Navigation */}
          <div className="px-6 py-4 bg-dark-element">
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-purple text-dark-text'
                      : 'bg-dark-card text-dark-text-secondary hover:bg-dark-border border border-dark-border'
                  }`}
                >
                  <span>{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section Content */}
          <div className="p-6">
            {activeSection === 'overview' && (
              <div className="prose prose-gray max-w-none">
                <p className="text-dark-text leading-relaxed font-source">{data.overview}</p>
              </div>
            )}

            {activeSection === 'objectives' && (
              <div>
                <h4 className="font-semibold text-dark-text mb-3 font-cabin">Learning Objectives</h4>
                <ul className="space-y-2">
                  {data.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary-blue rounded-full mt-2 flex-shrink-0" />
                      <span className="text-dark-text font-source">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection === 'concepts' && (
              <div>
                <h4 className="font-semibold text-dark-text mb-4 font-cabin">Key Concepts</h4>
                <div className="space-y-4">
                  {data.key_concepts.map((concept, index) => (
                    <div key={index} className="bg-dark-element rounded-lg p-4">
                      <h5 className="font-medium text-dark-text mb-2 font-cabin">{concept.concept}</h5>
                      <p className="text-dark-text mb-3 font-source">{concept.explanation}</p>
                      {concept.example && (
                        <div className="bg-primary-blue bg-opacity-10 border-l-4 border-primary-blue p-3 rounded">
                          <p className="text-sm text-primary-blue font-source">
                            <strong>Example:</strong> {concept.example}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'applications' && (
              <div>
                <h4 className="font-semibold text-dark-text mb-3 font-cabin">Practical Applications</h4>
                <ul className="space-y-2">
                  {data.practical_applications.map((application, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-dark-text font-source">{application}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSection === 'pitfalls' && (
              <div>
                <h4 className="font-semibold text-dark-text mb-4 font-cabin">Common Pitfalls</h4>
                <div className="space-y-4">
                  {data.common_pitfalls.map((pitfall, index) => (
                    <div key={index} className="bg-badge-red bg-opacity-10 border border-badge-red border-opacity-30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-badge-red mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div className="flex-1">
                          <h5 className="font-medium text-badge-red mb-2 font-cabin">{pitfall.pitfall}</h5>
                          <p className="text-badge-red text-sm font-source">
                            <strong>Solution:</strong> {pitfall.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'next-steps' && (
              <div>
                <h4 className="font-semibold text-dark-text mb-3 font-cabin">Next Steps</h4>
                <ul className="space-y-2">
                  {data.next_steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-secondary-green bg-opacity-20 text-secondary-green rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-dark-text font-source">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mentor Integration Footer */}
      {onAskMentor && mentor_context && (
        <div className="p-6 bg-gradient-to-r from-primary-blue bg-opacity-10 to-primary-purple bg-opacity-10 border-t border-dark-border">
          <div className="flex items-start gap-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-primary-blue mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div>
              <h4 className="font-medium text-dark-text mb-1 font-cabin">Ask the AI Mentor</h4>
              <p className="text-sm text-dark-text-secondary mb-3 font-source">
                Get personalized guidance about this resource for your project
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {mentor_context.sample_questions.slice(0, 3).map((question, index) => (
              <button
                key={index}
                onClick={() => handleAskMentor(question)}
                className="text-sm bg-dark-card text-primary-blue px-3 py-2 rounded-lg border border-primary-blue border-opacity-30 hover:bg-primary-blue hover:bg-opacity-10 transition-colors font-source"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};