import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VideoLesson from "./pages/VideoLesson";
import NotFound from "./pages/NotFound";
import Journey from "./pages/Journey";
import MyContents from "./pages/MyContents";
import Profile from "./pages/Profile";
import { DashboardLayout } from "./components/layouts/DashboardLayout";

const queryClient = new QueryClient();

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, info: unknown) {
    console.error("ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Ocorreu um erro</h1>
            <p className="text-muted-foreground">
              Tente novamente ou volte ao início.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => this.setState({ hasError: false })}
              >
                Tentar novamente
              </button>
              <a href="/" className="px-4 py-2 border rounded">
                Início
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/registro"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ErrorBoundary>
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          </ErrorBoundary>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="jornada" element={<Journey />} />
        <Route path="conteudos" element={<MyContents />} />
        <Route path="aula/:id" element={<VideoLesson />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="*" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
