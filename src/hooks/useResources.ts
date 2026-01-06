import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Resource, ResourcesResponse } from "@/types/resources";

export function useResources() {
  const {
    data: resources = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => {
      console.log("[useResources] Iniciando busca de recursos...");

      try {
        // Add timestamp to prevent caching

        const isDev = import.meta.env.MODE === "development";
        const baseUrl = isDev
          ? "/api-external"
          : "https://musicatos.vercel.app/api";
        const url = `${baseUrl}/resources`;

        console.log(`[useResources] URL da requisição: ${url}`);

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            // Explicitly request no cache
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        console.log(`[useResources] Status da resposta: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `[useResources] Erro na API: ${response.status} - ${errorText}`
          );
          throw new Error(`Falha ao carregar recursos: ${response.status}`);
        }

        const data: ResourcesResponse = await response.json();
        console.log("[useResources] Dados recebidos:", data);

        if (!data.data) {
          console.warn(
            "[useResources] Estrutura de dados inesperada: propriedade 'data' ausente",
            data
          );
          return [];
        }

        return data.data;
      } catch (err) {
        console.error("[useResources] Erro ao buscar recursos:", err);
        // Throw to let react-query handle the error state,
        // but since the original code had a fallback to demo data,
        // we can return that or let the onError handler deal with it.
        // However, useQuery doesn't have an onError callback in v5 in the same way.
        // We will return the demo data here to maintain behavior.

        console.log(
          "[useResources] Usando dados de demonstração devido a erro."
        );
        return [
          {
            id: "demo-1",
            type: "youtube",
            path: "https://www.youtube.com/watch?v=GJC9zdMG1UQ",
            originalName: "Aula Demonstrativa (Fallback)",
            categoryPath: "Aula de musica",
            size: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdById: "demo",
          },
        ] as Resource[];
      }
    },
    enabled: true,
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
