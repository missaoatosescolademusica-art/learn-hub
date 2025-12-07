import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Resource {
  id: string;
  type: string;
  path: string;
  originalName: string;
  size: number | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

interface ResourcesResponse {
  data: Resource[];
  page: number;
  totalPages: number;
}

export function useResources() {
  const { apiToken } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResources() {
      if (!apiToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('https://musicatos.vercel.app/api/resources', {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar recursos');
        }

        const data: ResourcesResponse = await response.json();
        setResources(data.data || []);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        
        // Demo data for testing
        setResources([
          {
            id: 'demo-1',
            type: 'youtube',
            path: 'https://www.youtube.com/watch?v=GJC9zdMG1UQ',
            originalName: 'Aula Demonstrativa',
            size: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdById: 'demo',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResources();
  }, [apiToken]);

  return { resources, isLoading, error };
}

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
