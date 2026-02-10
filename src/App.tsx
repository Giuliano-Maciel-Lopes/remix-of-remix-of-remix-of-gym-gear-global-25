import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import AuthPage from "./pages/Auth";
import DashboardPage from "./pages/Dashboard";
import CatalogPage from "./pages/Catalog";
import SuppliersPage from "./pages/Suppliers";
import SKUMappingPage from "./pages/SKUMapping";
import QuotesPage from "./pages/Quotes";
import QuoteDetailPage from "./pages/QuoteDetail";
import LogisticsPage from "./pages/Logistics";
import ClientsPage from "./pages/Clients";
import ComparatorPage from "./pages/Comparator";
import SupplierPricesPage from "./pages/SupplierPrices";
import AIReportsPage from "./pages/AIReports";
import NotFound from "./pages/NotFound";

// Layout
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary animate-pulse flex items-center justify-center">
          <span className="text-primary-foreground font-bold">G</span>
        </div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

// App routes with auth
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
      />
      {/* Legacy login redirect */}
      <Route 
        path="/login" 
        element={<Navigate to="/auth" replace />} 
      />
      
      {/* Protected routes with layout */}
      <Route 
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/sku-mapping" element={<SKUMappingPage />} />
        <Route path="/prices" element={<SupplierPricesPage />} />
        <Route path="/comparator" element={<ComparatorPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
        <Route path="/ai" element={<AIReportsPage />} />
      </Route>
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
