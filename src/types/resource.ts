export interface OriginalResourceData {
  url: string;
  title: string;
  description: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
  word_count: number;
  scraped_at: number;
}

export interface EnhancedResourceData {
  title: string;
  overview: string;
  learning_objectives: string[];
  key_concepts: Array<{
    concept: string;
    explanation: string;
    example: string;
  }>;
  practical_applications: string[];
  common_pitfalls: Array<{
    pitfall: string;
    solution: string;
  }>;
  next_steps: string[];
  difficulty_level: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_reading_time: string;
  original_url: string;
  source_title: string;
  word_count: number;
}

export interface MentorContext {
  resource_summary: string;
  key_topics: string[];
  sample_questions: string[];
  key_concepts: string[];
  mentor_guidance: string;
  resource_title?: string;
  resource_url?: string;
}

export interface EnhancedResource {
  id?: string;
  original_data: OriginalResourceData;
  enhanced_resource: EnhancedResourceData;
  mentor_context: MentorContext;
  processed_at: number;
  created_at?: string;
}

export interface ResourceProcessingResponse {
  success: boolean;
  enhanced_resources: EnhancedResource[];
  count: number;
}