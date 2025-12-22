import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import {
  Mail,
  Lock,
  ArrowLeft,
  Loader2,
  BookOpen,
  ArrowUpRight,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20">
        <div className="w-full max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o início
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              Musicatos Hub
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground mb-8">
            Entre na sua conta para continuar aprendendo
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              to="/registro"
              className="text-primary hover:underline font-medium"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 gradient-primary relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <div className="flex justify-center">
            <img
              src="/Logo.jpg"
              alt="Musicatos Hub"
              className="h-56 w-56 rounded-full object-cover mb-4"
            />
          </div>
          <span className="text-4xl font-black text-primary-foreground mb-12">
            Musicatos Hub
          </span>
          <h2 className="text-2xl font-medium text-primary-foreground mt-4 mb-4 flex items-center justify-center">
            Continue sua jornada
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Retome seus estudos de onde parou e alcance seus objetivos.
          </p>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>
    </div>
  );
}
