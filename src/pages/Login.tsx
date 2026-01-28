/**
 * Login Page
 * Mock authentication - any email/password combination works
 * Redirects to dashboard after successful login
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha email e senha.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Bem-vindo!',
          description: 'Login realizado com sucesso.',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <Package className="w-7 h-7 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold">GymTrade Pro</span>
            </div>
            
            {/* Tagline */}
            <h1 className="text-4xl font-bold mb-4">
              Trading & Importação de Equipamentos
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Gerencie fornecedores, compare preços, calcule custos de importação 
              e otimize suas compras de equipamentos de academia.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              {[
                'Comparativo de preços FOB e Landed',
                'Cálculo automático de impostos por país',
                'Gestão de contêineres e logística',
                'Mapeamento de SKU entre fornecedores',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">GymTrade Pro</span>
          </div>

          {/* Form header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Entrar na plataforma</h2>
            <p className="text-muted-foreground mt-2">
              Use qualquer email e senha para acessar
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Modo Demo:</strong> Qualquer combinação de email e senha funcionará.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
