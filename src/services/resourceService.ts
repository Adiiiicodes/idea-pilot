import { EnhancedResource, ResourceProcessingResponse } from '@/types/resource';

// Use local API routes instead of direct backend URL to avoid CORS issues
const API_BASE_URL = '/api';

// Fallback resource generator
const createFallbackResource = (url: string, error: string) => ({
  url,
  title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
  content: 'Resource unavailable - visit link directly',
  success: false,
  error,
  enhanced_content: {
    enhanced_title: 'External Resource',
    summary: 'This resource could not be processed automatically.',
    ai_mentor_note: 'Visit the resource directly for information.',
  },
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
          enhanced_resources: urls.map((url) => ({
            id: `fallback-${Date.now()}-${Math.random()}`,
            original_data: {
              url,
              title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
              description: 'Resource unavailable - visit link directly',
              content: 'This resource could not be processed automatically.',
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
              mentor_guidance: 'This resource could not be processed automatically. Please visit the source link directly.',
              resource_title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
              resource_url: url,
            },
            processed_at: Date.now(),
          })),
          count: urls.length,
        } as ResourceProcessingResponse;
      }

      // Try to parse JSON, fallback if parsing fails
      try {
        const data = await response.json();
        console.log('ResourceService: Successfully parsed response');
        
        // Defensive: ensure the response has the expected structure
        if (!data || !Array.isArray(data.enhanced_resources)) {
          console.warn('ResourceService: Unexpected response structure, using fallback');
          return {
            success: false,
            enhanced_resources: urls.map((url) => ({
              id: `fallback-${Date.now()}-${Math.random()}`,
              original_data: {
                url,
                title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
                description: 'Resource unavailable - visit link directly',
                content: 'Malformed response from backend',
                sections: [],
                word_count: 0,
                scraped_at: Date.now(),
              },
              enhanced_resource: {
                title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
                overview: 'The backend returned an unexpected response format.',
                learning_objectives: ['Visit the resource directly to understand the content'],
                key_concepts: [{
                  concept: 'External Resource',
                  explanation: 'This resource requires direct access',
                  example: 'Click the source link to view the content'
                }],
                practical_applications: ['Visit the resource for practical information'],
                common_pitfalls: [{
                  pitfall: 'Unexpected response format',
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
                resource_summary: 'External resource with processing issues',
                key_topics: ['External Resource'],
                sample_questions: [
                  'What is this resource about?',
                  'How can I access this content?',
                  'Is there an alternative resource?'
                ],
                key_concepts: ['External Resource Access'],
                mentor_guidance: 'There was an issue processing this resource. Please visit the source link directly.',
                resource_title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
                resource_url: url,
              },
              processed_at: Date.now(),
            })),
            count: urls.length,
          } as ResourceProcessingResponse;
        }
        
        return data;
      } catch (parseError) {
        console.error('ResourceService: JSON parse error:', parseError);
        return {
          success: false,
          enhanced_resources: urls.map((url) => ({
            id: `fallback-${Date.now()}-${Math.random()}`,
            original_data: {
              url,
              title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
              description: 'Resource unavailable - visit link directly',
              content: 'Invalid JSON response from backend',
              sections: [],
              word_count: 0,
              scraped_at: Date.now(),
            },
            enhanced_resource: {
              title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
              overview: 'The backend returned an invalid response.',
              learning_objectives: ['Visit the resource directly to understand the content'],
              key_concepts: [{
                concept: 'External Resource',
                explanation: 'This resource requires direct access',
                example: 'Click the source link to view the content'
              }],
              practical_applications: ['Visit the resource for practical information'],
              common_pitfalls: [{
                pitfall: 'Invalid backend response',
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
              resource_summary: 'External resource with processing issues',
              key_topics: ['External Resource'],
              sample_questions: [
                'What is this resource about?',
                'How can I access this content?',
                'Is there an alternative resource?'
              ],
              key_concepts: ['External Resource Access'],
              mentor_guidance: 'There was an issue processing this resource. Please visit the source link directly.',
              resource_title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
              resource_url: url,
            },
            processed_at: Date.now(),
          })),
          count: urls.length,
        } as ResourceProcessingResponse;
      }
    } catch (error: any) {
      console.error('ResourceService: Network or unexpected error:', error);
      // Network or unexpected error, return fallback data
      return {
        success: false,
        enhanced_resources: urls.map((url) => ({
          id: `fallback-${Date.now()}-${Math.random()}`,
          original_data: {
            url,
            title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
            description: 'Resource unavailable - visit link directly',
            content: error?.message || 'Unknown error',
            sections: [],
            word_count: 0,
            scraped_at: Date.now(),
          },
          enhanced_resource: {
            title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
            overview: 'There was a network error while processing this resource.',
            learning_objectives: ['Visit the resource directly to understand the content'],
            key_concepts: [{
              concept: 'External Resource',
              explanation: 'This resource requires direct access',
              example: 'Click the source link to view the content'
            }],
            practical_applications: ['Visit the resource for practical information'],
            common_pitfalls: [{
              pitfall: 'Network connectivity issue',
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
            resource_summary: 'External resource with network issues',
            key_topics: ['External Resource'],
            sample_questions: [
              'What is this resource about?',
              'How can I access this content?',
              'Is there an alternative resource?'
            ],
            key_concepts: ['External Resource Access'],
            mentor_guidance: 'There was a network issue processing this resource. Please visit the source link directly.',
            resource_title: `Resource from ${(() => { try { return new URL(url).hostname; } catch { return 'unknown'; } })()}`,
            resource_url: url,
          },
          processed_at: Date.now(),
        })),
        count: urls.length,
      } as ResourceProcessingResponse;
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
      return data;
    } catch (error) {
      console.error('ResourceService: Error getting enhanced resources:', error);
      return [];
    }
  }
}