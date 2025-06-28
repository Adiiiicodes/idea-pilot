import { EnhancedResource, ResourceProcessingResponse } from '@/types/resource';

// Always use /api for proxying through Next.js API route
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://00fd-136-232-6-66.ngrok-free.app';;

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

      if (!response.ok) {
        // Backend error, return fallback data for each URL
        return {
          resources: urls.map((url) =>
            createFallbackResource(url, `HTTP error! status: ${response.status}`)
          ),
          fallback: true,
        } as ResourceProcessingResponse;
      }

      // Try to parse JSON, fallback if parsing fails
      try {
        const data = await response.json();
        // Defensive: ensure resources is always an array of objects
        if (!data || !Array.isArray(data.resources)) {
          return {
            resources: urls.map((url) =>
              createFallbackResource(url, 'Malformed response from backend')
            ),
            fallback: true,
          } as ResourceProcessingResponse;
        }
        return data;
      } catch (parseError) {
        return {
          resources: urls.map((url) =>
            createFallbackResource(url, 'Invalid JSON response from backend')
          ),
          fallback: true,
        } as ResourceProcessingResponse;
      }
    } catch (error: any) {
      // Network or unexpected error, return fallback data
      return {
        resources: urls.map((url) =>
          createFallbackResource(url, error?.message || 'Unknown error')
        ),
        fallback: true,
      } as ResourceProcessingResponse;
    }
  }

  static async getEnhancedResources(projectId: string): Promise<EnhancedResource[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced-resources/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Defensive: ensure data is always an array
      if (!Array.isArray(data)) {
        return [];
      }
      return data;
    } catch (error) {
      console.error('Error getting enhanced resources:', error);
      return [];
    }
  }
}

