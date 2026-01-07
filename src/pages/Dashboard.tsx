import { Sidebar } from "@/components/Sidebar";
import { VideoCard } from "@/components/VideoCard";
import { useResources } from "@/hooks/useResources";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Dashboard() {
  const { resources, isLoading, error } = useResources();
  const [searchQuery, setSearchQuery] = useState("");

  // Debug logs
  console.log("[Dashboard] State:", {
    resourcesCount: resources.length,
    resources: resources,
    isLoading,
    error,
  });

  const filteredResources = resources.filter((resource) =>
    resource.originalName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:pl-0">
        {" "}
        <div className="p-6 lg:p-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Aulas
            </h1>
            <p className="text-muted-foreground text-lg">
              Assista às vídeo aulas e aprenda no seu ritmo
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar aulas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Carregando aulas...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <img
                  src="/Logo.jpg"
                  alt="Musicatos Hub"
                  className="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery
                  ? "Nenhuma aula encontrada"
                  : "Nenhuma aula disponível"}
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? "Tente buscar por outro termo"
                  : "As aulas serão exibidas aqui quando estiverem disponíveis"}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredResources.map((resource, index) => (
                <VideoCard
                  key={resource.id}
                  resource={resource}
                  index={index}
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-center text-muted-foreground mt-4 text-sm">
              Nota: Exibindo dados de demonstração
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
