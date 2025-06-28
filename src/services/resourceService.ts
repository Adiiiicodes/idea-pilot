import { EnhancedResource, ResourceProcessingResult } from '@/types/resource';

export class ResourceService {
  static async processResources(
    urls: string[], 
    projectContext: any, 
    projectId?: string
  ): Promise<ResourceProcessingResult> {
    try {
      const response = await fetch('/api/process-resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          projectContext,
          projectId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process resources');
      }

      return await response.json();
    } catch (error) {
      console.error('Resource processing error:', error);
      throw error;
    }
  }
} 