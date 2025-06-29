'use client';

import { useState, useEffect } from 'react';
import { ResourceProcessor } from '@/components/resources/ResourceProcessor';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { EnhancedResource } from '@/types/resource';
import RoadmapVisualizer from '@/components/RoadmapVisualizer';
import ConceptVisualizer from '@/components/ConceptVisualizer';

// Define types for the project structure
interface CodeSnippet {
  milestoneIndex: number;
  code: string;
  debugHint?: string;
}

interface Milestone {
  task: string;
  description: string;
  estimatedTime: string;
  resourceLink: string;
}

interface ResourcePack {
  links: string[];
  wildcardLink: string;
  markdownContent: string;
}

interface Project {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  domain: string;
  vibe: string;
  milestones: Milestone[];
  tools: string[];
  codeSnippets: CodeSnippet[];
  resourcePack: ResourcePack;
}

interface ChatResponse {
  message: string;
  followUpQuestions: string[];
  resourceLink: string;
}

// Define props for the component
interface ProjectCardProps {
  project: Project;
  chatResponse?: ChatResponse; // Make this optional
  onRefresh: () => void;
  onSave: () => void;
  conceptText: string;
  experienceLevel: number;
  onSendMessage?: (message: string) => void; // Add this for mentor integration
}

export default function ProjectCard({ 
  project, 
  chatResponse, 
  onRefresh, 
  onSave,
  conceptText = "",
  experienceLevel = 2,
  onSendMessage
}: ProjectCardProps) {
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);
  const [enhancedResources, setEnhancedResources] = useState<EnhancedResource[]>([]);
  const [showResourceProcessor, setShowResourceProcessor] = useState(false);
  
  // Load saved milestone completion state from localStorage
  useEffect(() => {
    if (!project?.title) return;
    
    const savedCompletions: number[] = [];
    (project.milestones || []).forEach((_, index) => {
      if (localStorage.getItem(`milestone_${project.title}_${index}`) === 'completed') {
        savedCompletions.push(index);
      }
    });
    if (savedCompletions.length > 0) {
      setCompletedMilestones(savedCompletions);
    }
  }, [project]);
  
  // Mark milestone as complete
  const markComplete = (index: number): void => {
    if (!completedMilestones.includes(index)) {
      const newCompleted = [...completedMilestones, index];
      setCompletedMilestones(newCompleted);
      
      // Save to localStorage
      if (project?.title) {
        localStorage.setItem(`milestone_${project.title}_${index}`, 'completed');
      }
    }
  };
  
  // Get badge color based on difficulty
  const getBadgeColor = (): string => {
    switch (project?.difficulty) {
      case 'Beginner': return '#10B981'; // Emerald Green
      case 'Intermediate': return '#F59E0B'; // Warm Orange
      case 'Advanced': return '#EF4444'; // Red
      default: return '#10B981';
    }
  };
  
  // Copy code to clipboard
  const copyToClipboard = (code: string): void => {
    // Remove markdown code fences if present
    const cleanedCode = code.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '');
    navigator.clipboard.writeText(cleanedCode);
    // Show toast or notification
    if (typeof window !== 'undefined') {
      alert('Code copied to clipboard!');
    }
  };
  
  // Download resource pack as markdown
  const downloadResourcePack = (): void => {
    if (!project?.resourcePack?.markdownContent || !project?.title) return;
    
    const element = document.createElement('a');
    const file = new Blob([project.resourcePack.markdownContent], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-resources.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Handle resource processing completion
  const handleResourceProcessingComplete = (resources: EnhancedResource[]) => {
    setEnhancedResources(resources);
    setShowResourceProcessor(false);
  };

  // If project is undefined or null, render a placeholder or return null
  if (!project) {
    return <div className="w-full p-4 bg-dark-card rounded-lg">Loading project data...</div>;
  }

  return (
    <div className="w-full bg-dark-card rounded-lg overflow-hidden shadow-md border border-dark-border">
      {/* Header with gradient overlay */}
      <div className="relative h-12 bg-gradient-to-r from-primary-purple to-primary-blue flex items-center px-4">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <h3 className="text-dark-text font-cabin font-bold text-lg relative z-10">{project.title}</h3>
        <span
          className="ml-auto px-3 py-1 text-sm text-dark-text rounded-full relative z-10"
          style={{ backgroundColor: getBadgeColor() }}
        >
          {project.difficulty}
        </span>
      </div>
      
      {/* Project description */}
      <div className="p-4 border-b border-dark-border">
        <p className="text-dark-text font-source">{project.description || "No description available."}</p>
      </div>
      
      {/* Tools needed */}
      <div className="p-4 border-b border-dark-border">
        <h4 className="text-dark-text font-cabin font-bold mb-2">Tools Needed:</h4>
        <div className="flex flex-wrap gap-2">
          {(project.tools || []).map((tool, index) => (
            <span key={index} className="px-3 py-1 bg-dark-element text-dark-text text-sm rounded-full border border-dark-border">
              {tool}
            </span>
          ))}
          {(!project.tools || project.tools.length === 0) && (
            <span className="text-dark-text-secondary">No tools specified</span>
          )}
        </div>
      </div>

      {/* Concept Map */}
      <div className="p-4 border-b border-dark-border">
        <h4 className="text-dark-text font-cabin font-bold mb-2">Concept Map:</h4>
        <ConceptVisualizer concepts={[
          {
            id: 'core',
            name: project.title,
            description: project.description,
            connections: project.tools || []
          },
          ...(project.tools || []).map(tool => ({
            id: tool.toLowerCase().replace(/\s+/g, '-'),
            name: tool,
            description: `Learn how to use ${tool} to build your project`,
            connections: ['core']
          }))
        ]} />
      </div>
      
      {/* AI Mentor Tip */}
      {chatResponse && (
        <div className="p-4 border-b border-dark-border bg-dark-element bg-opacity-30">
          <h4 className="text-dark-text font-cabin font-bold mb-2">AI Mentor Tip:</h4>
          <p className="text-dark-text font-source mb-2">{chatResponse.message}</p>
          {chatResponse.resourceLink && (
            <a 
              href={chatResponse.resourceLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-blue text-sm underline hover:text-primary-purple"
            >
              Helpful Resource
            </a>
          )}
        </div>
      )}

      {/* Enhanced Resources Section */}
      {project.resourcePack?.links && project.resourcePack.links.length > 0 && (
        <div className="p-4 border-b border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-dark-text font-cabin font-bold mb-1">Learning Resources</h4>
              <p className="text-dark-text-secondary text-sm font-source">
                AI-enhanced resources tailored for your project
              </p>
            </div>
            
            {enhancedResources.length === 0 && !showResourceProcessor && (
              <button
                onClick={() => setShowResourceProcessor(true)}
                className="bg-primary-blue text-dark-text px-4 py-2 rounded-lg hover:bg-primary-purple transition-colors font-medium font-cabin"
              >
                Enhance Resources
              </button>
            )}
          </div>

          {showResourceProcessor && (
            <div className="mb-6">
              <ResourceProcessor
                urls={project.resourcePack.links}
                projectContext={project}
                projectId={project.title} // Using title as projectId for now
                onProcessingComplete={handleResourceProcessingComplete}
                onError={(error: any) => {
                  console.error('Resource processing error:', error);
                  setShowResourceProcessor(false);
                }}
              />
            </div>
          )}

          {enhancedResources.length > 0 ? (
            <ResourceGrid
              resources={enhancedResources}
              onAskMentor={(question: string) => {
                // Integrate with existing mentor chat
                if (onSendMessage) {
                  onSendMessage(question);
                }
              }}
            />
          ) : !showResourceProcessor ? (
            // Fallback to original links if no enhanced resources
            <div className="space-y-4">
              <h5 className="text-lg font-semibold text-dark-text mb-4 font-cabin">Original Resources</h5>
              <div className="grid gap-3">
                {project.resourcePack.links.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-dark-element rounded-lg hover:bg-dark-border transition-colors group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-dark-text-secondary group-hover:text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-primary-blue hover:text-primary-purple font-medium font-source flex-1">
                      {link}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-dark-text-secondary group-hover:text-primary-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
              <div className="mt-4 p-4 bg-primary-blue bg-opacity-10 border border-primary-blue border-opacity-30 rounded-lg">
                <p className="text-primary-blue text-sm font-source">
                  💡 <strong>Tip:</strong> Click &quot;Enhance Resources&quot; to get AI-processed summaries, 
                  learning objectives, and integrated mentor guidance for these resources.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
      
      {/* Milestones - Using the new RoadmapVisualizer */}
      <div className="p-4">
        <RoadmapVisualizer 
          milestones={project.milestones || []}
          completedMilestones={completedMilestones}
          onComplete={markComplete}
        />
      </div>
      
      {/* Code Snippets Section */}
      {project.codeSnippets && project.codeSnippets.length > 0 && (
        <div className="p-4 border-t border-dark-border">
          <h4 className="text-dark-text font-cabin font-bold mb-3">Code Snippets:</h4>
          <div className="space-y-4">
            {project.codeSnippets.map((snippet, index) => (
              <div key={index} className="mt-2 p-3 bg-dark-element rounded-md border border-dark-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-dark-text-secondary">
                    For Milestone: {snippet.milestoneIndex + 1}
                  </span>
                  <button
                    onClick={() => copyToClipboard(snippet.code)}
                    className="text-xs px-2 py-1 bg-primary-blue text-dark-text rounded hover:bg-primary-purple"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-sm overflow-x-auto font-jetbrains text-dark-text whitespace-pre-wrap bg-black bg-opacity-30 p-2 rounded">
                  {snippet.code.replace(/^```[\s\S]*?\n/, '').replace(/```$/, '')}
                </pre>
                {snippet.debugHint && (
                  <div className="mt-2 p-2 bg-accent-yellow bg-opacity-20 rounded text-xs text-dark-text">
                    <strong>Debug Hint:</strong> {snippet.debugHint}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="p-4 bg-dark-element flex flex-wrap gap-3">
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-primary-blue text-dark-text rounded-md font-cabin transition-all duration-200 hover:scale-105 hover:bg-accent-pink flex-1"
        >
          Regenerate Idea
        </button>
        <button
          onClick={downloadResourcePack}
          className="px-4 py-2 bg-secondary-orange text-dark-text rounded-md font-cabin transition-all duration-200 hover:scale-105 hover:bg-accent-yellow flex-1"
          disabled={!project.resourcePack?.markdownContent}
        >
          Download Resources
        </button>
      </div>
    </div>
  );
}