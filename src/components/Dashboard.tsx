"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, saveProject, getUserProjects, signOut } from '@/lib/supabase';
import ProjectGeneratorForm from '@/components/ProjectGeneratorForm';
import ProjectCard from '@/components/ProjectCard';
import AIMentorChat from '@/components/AIMentorChat';
import CommunityChat from '@/components/CommunityChat';
import PrivateChat from '@/components/PrivateChat';
import QuickStartGuide from '@/components/QuickStartGuide';
import { SavedProject } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useChatContext } from '@/app/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Project response types
interface Milestone {
  task: string;
  description: string;
  estimatedTime: string;
  resourceLink: string;
}

interface CodeSnippet {
  milestoneIndex: number;
  code: string;
  debugHint?: string;
}

interface ResourcePack {
  links: string[];
  wildcardLink: string;
  markdownContent: string;
}

interface ProjectDetails {
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

interface ProjectResponse {
  project: ProjectDetails;
  chatResponse: ChatResponse;
}

// Parsed project interface
interface ParsedSavedProject extends Omit<SavedProject, 'project_details'> {
  project_details: ProjectDetails;
}

export default function Dashboard() {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [regenerating, setRegenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'saved' | 'community' | 'private'>('generator');
  const [generatedProject, setGeneratedProject] = useState<ProjectResponse | null>(null);
  const [savedProjects, setSavedProjects] = useState<ParsedSavedProject[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [lastExperienceLevel, setLastExperienceLevel] = useState<number>(2);
  
  // Quick Start Guide state - only show for new users
  const [showQuickStart, setShowQuickStart] = useState<boolean>(false);
  
  // Hooks
  const router = useRouter();
  const { isNewUser, setIsNewUser } = useAuth();
  
  // Removing unused variables from useChatContext
  const { /* userId, projectIds, setProjectId */ } = useChatContext();
  
  // Check authentication on load
  useEffect(() => {
    const checkAuthentication = async (): Promise<void> => {
      try {
        const { user, error } = await getCurrentUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        
        if (activeTab === 'saved') {
          await loadSavedProjects(user.id);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthentication();
  }, [router, activeTab]);

  // Show Quick Start Guide only for new users (after signup)
  useEffect(() => {
    if (!loading && user && isNewUser) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowQuickStart(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, user, isNewUser]);
  
  // Load user's saved projects from the new API endpoint
  const loadSavedProjects = async (userId: string): Promise<void> => {
    setLoading(true);
    try {
      // First try to use the fetch API with the new Next.js route
      try {
        console.log('Fetching saved projects from API');
        const response = await fetch(`/api/user-projects/${userId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const projects = await response.json();
        console.log('Projects from API:', projects);
        
        // Parse the project_details JSON strings into objects
        const parsedProjects = projects.map((project: any) => ({
          ...project,
          project_details: typeof project.project_details === 'string' 
            ? JSON.parse(project.project_details) 
            : project.project_details
        }));
        
        console.log('Parsed projects:', parsedProjects);
        setSavedProjects(parsedProjects);
        return;
      } catch (apiError) {
        console.error('API fetch failed, falling back to Supabase:', apiError);
      }
      
      // Fallback to the old Supabase method if the API fails
      const { data, error } = await getUserProjects(userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        // Parse the project_details for each project
        const parsedProjects = data.map(project => ({
          ...project,
          project_details: typeof project.project_details === 'string'
            ? JSON.parse(project.project_details)
            : project.project_details
        }));
        
        setSavedProjects(parsedProjects);
      }
    } catch (error) {
      console.error('Failed to load saved projects:', error);
      toast.error('Could not load your saved projects');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle project generation callback
  const handleProjectGenerated = (response: ProjectResponse, experienceLevel: number): void => {
    let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate';
    if (experienceLevel === 1) difficulty = 'Beginner';
    else if (experienceLevel === 2) difficulty = 'Intermediate';
    else if (experienceLevel === 3) difficulty = 'Advanced';
    const fixedProject = {
      ...response.project,
      difficulty,
    };
    setGeneratedProject({ ...response, project: fixedProject });
    setIsChatOpen(true);
    toast.success('Project generated successfully!');
  };

  const handleRefreshProjectViaProxy = async (): Promise<void> => {
    try {
      setRegenerating(true);
      
      const response = await fetch('/api/regenerate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const regeneratedProject = await response.json();
      setGeneratedProject(regeneratedProject);
      setIsChatOpen(true);
      
      toast.success('Project regenerated successfully via proxy!');
    } catch (error) {
      console.error('Error regenerating project via proxy:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Proxy error: ' + errorMessage);
    } finally {
      setRegenerating(false);
    }
  };
  
  // Save project to user account
  const handleSaveProject = async (): Promise<void> => {
    if (!generatedProject || !user) {
      toast.error('Cannot save project: Missing project data or user');
      return;
    }
    
    const conceptElement = document.getElementById('concept') as HTMLTextAreaElement | null;
    const experienceElement = document.getElementById('experience') as HTMLInputElement | null;
    
    if (!conceptElement || !experienceElement) {
      toast.error('Cannot save project: Missing form data');
      return;
    }
    
    try {
      const { error } = await saveProject(user.id, {
        concept: conceptElement.value,
        experienceLevel: parseInt(experienceElement.value),
        domain: generatedProject.project.domain,
        project: generatedProject.project
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Success handling
      toast.success('Project saved successfully!');
      
      // Refresh saved projects if on saved tab
      if (activeTab === 'saved') {
        await loadSavedProjects(user.id);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to save project: ' + errorMessage);
    }
  };
  
  // Handle user logout
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to sign out: ' + errorMessage);
    }
  };
  
  // Change active tab
  const switchTab = (tab: 'generator' | 'saved' | 'community' | 'private'): void => {
    setActiveTab(tab);
    
    if (tab === 'saved' && user) {
      loadSavedProjects(user.id);
    }
  };

  // Handle Quick Start Guide close
  const handleQuickStartClose = (): void => {
    setShowQuickStart(false);
    setIsNewUser(false); // Mark user as no longer new
  };
  
  // Render loading spinner
  const renderLoading = () => (
    <div className="flex justify-center items-center h-64">
      <svg className="animate-spin h-10 w-10 text-primary-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
  
  // Render the navigation sidebar
  const renderSidebar = () => (
    <div className="w-full lg:w-64 flex-shrink-0">
      {/* Navigation */}
      <div className="bg-dark-card rounded-lg shadow-md border border-dark-border overflow-hidden">
        <div className="p-4 bg-dark-element text-dark-text">
          <h2 className="font-bold font-cabin">Navigation</h2>
        </div>
        <nav className="p-2">
          <button
            onClick={() => switchTab('generator')}
            className={`w-full text-left p-3 rounded-md mb-2 transition-colors font-source ${
              activeTab === 'generator'
                ? 'bg-accent-pink text-dark-text'
                : 'hover:bg-dark-element text-dark-text'
            }`}
          >
            Project Generator
          </button>
          <button
            onClick={() => switchTab('saved')}
            className={`w-full text-left p-3 rounded-md mb-2 transition-colors font-source ${
              activeTab === 'saved'
                ? 'bg-accent-pink text-dark-text'
                : 'hover:bg-dark-element text-dark-text'
            }`}
          >
            Saved Projects
          </button>
          <button
            onClick={() => switchTab('community')}
            className={`w-full text-left p-3 rounded-md mb-2 transition-colors font-source ${
              activeTab === 'community'
                ? 'bg-accent-pink text-dark-text'
                : 'hover:bg-dark-element text-dark-text'
            }`}
          >
            Community Chat
          </button>
          
        </nav>
      </div>
      
      {/* Domain Icons */}
      <div className="bg-dark-card rounded-lg shadow-md border border-dark-border overflow-hidden mt-4">
        <div className="p-4 bg-dark-element text-dark-text">
          <h2 className="font-bold font-cabin">Project Domains</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {['coding', 'hardware', 'design', 'research'].map((area) => (
              <div
                key={area}
                className="p-3 bg-dark-element rounded-md border border-dark-border text-center hover:border-primary-purple transition-colors"
              >
                <div className="w-10 h-10 mx-auto mb-2 bg-primary-purple rounded-full flex items-center justify-center text-dark-text">
                  {area === 'coding' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  )}
                  {area === 'hardware' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  )}
                  {area === 'design' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  )}
                  {area === 'research' && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-dark-text capitalize font-source">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Start Button - Always available for manual access */}
      <div className="bg-dark-card rounded-lg shadow-md border border-dark-border overflow-hidden mt-4">
        <div className="p-4">
          <button
            onClick={() => setShowQuickStart(true)}
            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-primary-purple to-primary-blue text-dark-text rounded-lg hover:from-accent-pink hover:to-primary-purple transition-all duration-200 hover:scale-105"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium font-cabin">Quick Start Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
  
  // Render the project generator tab content
  const renderGeneratorTab = () => (
    <div className="space-y-8">
      {!generatedProject ? (
        <ProjectGeneratorForm onProjectGenerated={handleProjectGenerated} />
      ) : (
        <ProjectCard
          project={generatedProject.project}
          chatResponse={generatedProject.chatResponse}
          onRefresh={regenerating ? () => {} : handleRefreshProjectViaProxy}
          onSave={handleSaveProject}
          conceptText=""
          experienceLevel={2}
        />
      )}
    </div>
  );
  
  // Render the saved projects tab content
  const renderSavedProjectsTab = () => {
    // Check if we're still loading
    if (loading) {
      return renderLoading();
    }
    
    return (
      <div>
        <h2 className="text-2xl font-bold text-dark-text mb-6 font-cabin">Your Saved Projects</h2>
        
        {savedProjects.length === 0 ? (
          <div className="bg-dark-card rounded-lg shadow-md border border-dark-border p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-dark-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-dark-text font-source">
              You haven&apos;t saved any projects yet. Generate a project idea and save it to see it here!
            </p>
            <button
              onClick={() => switchTab('generator')}
              className="mt-4 px-4 py-2 bg-primary-purple text-dark-text rounded-md hover:bg-accent-pink transition-colors font-cabin"
            >
              Generate a Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {savedProjects.map((savedProject) => {
              console.log('Rendering saved project:', savedProject.id);
              console.log('Project details:', savedProject.project_details);
              
              return (
                <div key={savedProject.id} className="bg-dark-card rounded-lg shadow-md border border-dark-border">
                  <ProjectCard
                    key={savedProject.id}
                    project={savedProject.project_details}
                    onRefresh={() => {}}
                    onSave={() => {}}
                    conceptText={savedProject.concept || ""}
                    experienceLevel={savedProject.experience_level || 2}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  // Render the community chat tab content
  const renderCommunityTab = () => (
    <div>
      <h2 className="text-2xl font-bold text-dark-text mb-6 font-cabin">Community Chat</h2>
      <CommunityChat />
    </div>
  );
  
  // Render the private chat tab content
  const renderPrivateChatTab = () => (
    <div>
      <h2 className="text-2xl font-bold text-dark-text mb-6 font-cabin">Private Messages</h2>
      <PrivateChat />
    </div>
  );
  
  // Render the AI mentor chat
  const renderAIMentorChat = () => {
    if (!generatedProject) return null;
    
    return (
      <div className={`fixed bottom-0 right-4 w-96 transition-all duration-300 shadow-lg z-10 ${
        isChatOpen ? 'h-[500px]' : 'h-12'
      }`}>
        <div
          className="bg-dark-element text-dark-text p-3 flex justify-between items-center cursor-pointer"
          onClick={() => setIsChatOpen(!isChatOpen)}
        >
          <h3 className="font-bold font-cabin">AI Project Mentor</h3>
          <button className="text-dark-text">
            {isChatOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        {isChatOpen && (
          <AIMentorChat 
            projectContext={generatedProject.project}
            initialMessage={generatedProject.chatResponse?.message}
            followUpQuestions={generatedProject.chatResponse?.followUpQuestions}
          />
        )}
      </div>
    );
  };
  
  // Render floating action button
  const renderFloatingActionButton = () => {
    if (activeTab === 'generator') return null;
    
    return (
      <button
        onClick={() => switchTab('generator')}
        className="fixed bottom-4 right-4 w-14 h-14 rounded-full bg-accent-pink text-dark-text shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105 hover:bg-primary-purple z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card text-dark-text py-4 px-6 border-b border-dark-border">
        <div className="container mx-auto flex justify-between items-center">
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
            <h1 className="text-2xl font-bold font-cabin">IdeaPilot AI</h1>
          </div>
          
          {user && (
            <div className="flex items-center">
              <span className="mr-4 text-dark-text-secondary font-source">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-primary-purple text-dark-text px-4 py-2 rounded-md hover:bg-accent-pink transition-colors font-cabin"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto py-8 px-4">
        {loading && activeTab !== 'saved' ? (
          renderLoading()
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            {renderSidebar()}
            
            {/* Main content area */}
            <div className="flex-1">
              {activeTab === 'generator' && renderGeneratorTab()}
              {activeTab === 'saved' && renderSavedProjectsTab()}
              {activeTab === 'community' && renderCommunityTab() }
              {activeTab === 'private' && renderPrivateChatTab()}
            </div>
            
            {/* Chat interface */}
            {renderAIMentorChat()}
            
            {/* Floating Action Button */}
            {renderFloatingActionButton()}
          </div>
        )}
      </main>

      {/* Quick Start Guide - Only show for new users */}
      {showQuickStart && (
        <QuickStartGuide onClose={handleQuickStartClose} />
      )}
    </div>
  );
}