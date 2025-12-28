import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";

export interface Resource {
  id: string;
  type: string;
  path: string;
  originalName: string;
  categoryPath: string;
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
  const { session } = useAuth();

  const {
    data: resources = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resources", session?.access_token],
    queryFn: async () => {
      if (!session?.access_token) {
        return [];
      }

      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(
          `https://musicatos.vercel.app/api/resources?t=${timestamp}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
              // Explicitly request no cache
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Falha ao carregar recursos");
        }

        const data: ResourcesResponse = await response.json();
        return data.data || [];
      } catch (err) {
        console.error("Error fetching resources:", err);
        // Throw to let react-query handle the error state,
        // but since the original code had a fallback to demo data,
        // we can return that or let the onError handler deal with it.
        // However, useQuery doesn't have an onError callback in v5 in the same way.
        // We will return the demo data here to maintain behavior.

        return [
          {
            id: "demo-1",
            type: "youtube",
            path: "https://www.youtube.com/watch?v=GJC9zdMG1UQ",
            originalName: "Aula Demonstrativa",
            categoryPath: "Aula de musica",
            size: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdById: "demo",
          },
        ] as Resource[];
      }
    },
    enabled: !!session?.access_token,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  return {
    resources,
    isLoading,
    error: error ? (error as Error).message : null,
  };
}

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
