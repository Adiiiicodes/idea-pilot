import { useState, useEffect } from 'react';
import { ResourceService } from '@/services/resourceService';
import { ResourceProcessingResponse } from '@/types/resource';

export const useResourceProcessing = () => {
  const [data, setData] = useState<ResourceProcessingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processResources = async (urls: string[], projectContext: any, projectId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ResourceService.processResources(urls, projectContext, projectId);
      setData(result);
      if (result.fallback) setError('Some resources could not be processed automatically.');
      return result;
    } catch (err: any) {
      setError(err?.message || 'Unknown error');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, processResources };
};

// Example usage in a component
import React, { useEffect } from 'react';
import { useResourceProcessing } from '@/hooks/useResourceProcessing';

const ResourceProcessor = ({ urls, projectContext, projectId }) => {
  const { data, loading, error, processResources } = useResourceProcessing();

  useEffect(() => {
    processResources(urls, projectContext, projectId);
  }, [urls, projectContext, projectId]);

  if (loading) return <div>Loading resources...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      {data?.resources.map(resource => (
        <div key={resource.url} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <h3>{resource.title}</h3>
          <p>{resource.content}</p>
          {!resource.success && (
            <div style={{ color: 'orange' }}>
              <strong>Fallback:</strong> {resource.error}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ResourceProcessor;