import { EnhancedResource, ResourceProcessingResponse } from '@/types/resource';

// Use local API routes instead of direct backend URL to avoid CORS issues
const API_BASE_URL = '/api';

// Helper function to map backend response to frontend types
const mapBackendResourceToFrontendType = (backendResource: any): EnhancedResource => {
  return {
    id: `resource-${Date.now()}-${Math.random()}`,
    original_data: {
      url: backendResource.url || '',
      title: backendResource.title || 'Unknown Resource',
      description: backendResource.summary || backendResource.enhanced_content?.summary || '',
      content: backendResource.content || '',
      sections: [],
      word_count: 0,
      scraped_at: backendResource.processed_at ? Math.floor(backendResource.processed_at * 1000) : Date.now(),
    },
    enhanced_resource: {
      title: backendResource.enhanced_content?.enhanced_title || backendResource.title || 'Unknown Resource',
      overview: backendResource.enhanced_content?.summary || backendResource.summary || 'No summary available',
      learning_objectives: backendResource.enhanced_content?.learning_objectives || ['Visit the resource directly to understand the content'],
      key_concepts: (backendResource.enhanced_content?.key_concepts || []).map((concept: any) => ({
        concept: typeof concept === 'string' ? concept : concept.concept || 'Unknown Concept',
        explanation: typeof concept === 'string' ? `Learn about ${concept}` : concept.explanation || 'No explanation available',
        example: typeof concept === 'string' ? `Example of ${concept}` : concept.example || 'No example available'
      })),
      practical_applications: backendResource.enhanced_content?.practical_applications || ['Visit the resource for practical information'],
      common_pitfalls: [{
        pitfall: backendResource.error ? 'Resource processing error' : 'No specific pitfalls identified',
        solution: backendResource.error ? 'Visit the source link directly' : 'Follow best practices from the resource'
      }],
      next_steps: backendResource.enhanced_content?.key_takeaways || ['Access the resource directly via the source link'],
      difficulty_level: (backendResource.enhanced_content?.difficulty_assessment || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
      estimated_reading_time: backendResource.enhanced_content?.estimated_read_time || 'Unknown',
      original_url: backendResource.url || '',
      source_title: backendResource.title || 'External Resource',
      word_count: 0,
    },
    mentor_context: {
      resource_summary: backendResource.enhanced_content?.summary || backendResource.summary || 'External resource',
      key_topics: backendResource.enhanced_content?.key_concepts || ['External Resource'],
      sample_questions: backendResource.enhanced_content?.follow_up_questions || [
        'What is this resource about?',
        'How can I apply this to my project?',
        'Are there any prerequisites?'
      ],
      key_concepts: backendResource.enhanced_content?.key_concepts || ['External Resource Access'],
      mentor_guidance: backendResource.enhanced_content?.ai_mentor_note || 'This resource provides valuable information for your project.',
      resource_title: backendResource.enhanced_content?.enhanced_title || backendResource.title || 'External Resource',
      resource_url: backendResource.url || '',
    },
    processed_at: backendResource.processed_at ? Math.floor(backendResource.processed_at * 1000) : Date.now(),
  };
};

// Fallback resource generator
const createFallbackResource = (url: string, error: string): EnhancedResource => ({
  id: `fallback-${Date.now()}-${Math.random()}`,
  original_data: {
    url,
    title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
    description: 'Resource unavailable - visit link directly',
    content: error,
    sections: [],
    word_count: 0,
    scraped_at: Date.now(),
  },
  enhanced_resource: {
    title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
    overview: 'This resource could not be processed automatically. Please visit the link directly for the content.',
    learning_objectives: ['Visit the resource directly to understand the content'],
    key_concepts: [{
      concept: 'External Resource',
      explanation: 'This resource requires direct access',
      example: 'Click the source link to view the content'
    }],
    practical_applications: ['Visit the resource for practical information'],
    common_pitfalls: [{
      pitfall: 'Resource not accessible',
      solution: 'Visit the source link directly'
    }],
    next_steps: ['Access the resource directly via the source link'],
    difficulty_level: 'Beginner' as const,
    estimated_reading_time: 'Unknown',
    original_url: url,
    source_title: 'External Resource',
    word_count: 0,
  },
  mentor_context: {
    resource_summary: 'External resource that requires direct access',
    key_topics: ['External Resource'],
    sample_questions: [
      'What is this resource about?',
      'How can I access this content?',
      'Is there an alternative resource?'
    ],
    key_concepts: ['External Resource Access'],
    mentor_guidance: error,
    resource_title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
    resource_url: url,
  },
  processed_at: Date.now(),
});

export class ResourceService {
  static async processResources(
    urls: string[],
    projectContext: any,
    projectId?: string
  ): Promise<ResourceProcessingResponse> {
    try {
      console.log('ResourceService: Processing resources via local API proxy');
      
      const response = await fetch(`${API_BASE_URL}/process-resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          projectContext,
          projectId,
        }),
      });

      console.log('ResourceService: Response status:', response.status);

      if (!response.ok) {
        console.error('ResourceService: Backend error, status:', response.status);
        // Backend error, return fallback data for each URL
        return {
          success: false,
          enhanced_resources: urls.map((url) => createFallbackResource(url, `Backend error: ${response.status}`)),
          count: urls.length,
        };
      }

      // Try to parse JSON, fallback if parsing fails
      try {
        const data = await response.json();
        console.log('ResourceService: Successfully parsed response');
        
        // Check if the response has the expected structure
        if (!data || !Array.isArray(data.enhanced_resources)) {
          console.warn('ResourceService: Unexpected response structure, using fallback');
          return {
            success: false,
            enhanced_resources: urls.map((url) => createFallbackResource(url, 'Unexpected response structure')),
            count: urls.length,
          };
        }
        
        // Map backend resources to frontend types
        const mappedResources = data.enhanced_resources.map((backendResource: any) => {
          try {
            return mapBackendResourceToFrontendType(backendResource);
          } catch (mappingError) {
            console.error('Error mapping resource:', mappingError);
            return createFallbackResource(
              backendResource.url || 'unknown', 
              `Mapping error: ${mappingError instanceof Error ? mappingError.message : 'Unknown error'}`
            );
          }
        });
        
        return {
          success: data.success !== false,
          enhanced_resources: mappedResources,
          count: mappedResources.length,
        };
      } catch (parseError) {
        console.error('ResourceService: JSON parse error:', parseError);
        return {
          success: false,
          enhanced_resources: urls.map((url) => createFallbackResource(url, 'JSON parse error')),
          count: urls.length,
        };
      }
    } catch (error: any) {
      console.error('ResourceService: Network or unexpected error:', error);
      // Network or unexpected error, return fallback data
      return {
        success: false,
        enhanced_resources: urls.map((url) => createFallbackResource(url, error?.message || 'Network error')),
        count: urls.length,
      };
    }
  }

  static async getEnhancedResources(projectId: string): Promise<EnhancedResource[]> {
    try {
      console.log('ResourceService: Getting enhanced resources via local API proxy');
      
      const response = await fetch(`${API_BASE_URL}/enhanced-resources/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('ResourceService: Error getting enhanced resources, status:', response.status);
        return [];
      }

      const data = await response.json();
      console.log('ResourceService: Successfully retrieved enhanced resources');
      
      // Defensive: ensure data is always an array
      if (!Array.isArray(data)) {
        console.warn('ResourceService: Enhanced resources response is not an array');
        return [];
      }

      // Map backend resources to frontend types if needed
      return data.map((backendResource: any) => {
        try {
          // If it's already in the correct format, return as is
          if (backendResource.enhanced_resource && backendResource.mentor_context) {
            return backendResource;
          }
          // Otherwise, map it
          return mapBackendResourceToFrontendType(backendResource);
        } catch (mappingError) {
          console.error('Error mapping stored resource:', mappingError);
          return createFallbackResource(
            backendResource.url || 'unknown', 
            `Stored resource mapping error: ${mappingError instanceof Error ? mappingError.message : 'Unknown error'}`
          );
        }
      });
    } catch (error) {
      console.error('ResourceService: Error getting enhanced resources:', error);
      return [];
    }
  }
}