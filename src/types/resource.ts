export interface EnhancedResource {
  id: string;
  url: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  keyConcepts: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  mentorNotes?: string;
  tags: string[];
  createdAt: string;
  projectId?: string;
}

export interface ResourceProcessingResult {
  enhanced_resources: EnhancedResource[];
  processing_time: number;
  success_count: number;
  error_count: number;
} 