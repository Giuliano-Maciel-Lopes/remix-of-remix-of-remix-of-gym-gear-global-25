import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CatalogPage from "./pages/Catalog";
import SuppliersPage from "./pages/Suppliers";
import SKUMappingPage from "./pages/SKUMapping";
import QuotesPage from "./pages/Quotes";
import QuoteDetailPage from "./pages/QuoteDetail";
import LogisticsPage from "./pages/Logistics";
import NotFound from "./pages/NotFound";

// Layout
import AppLayout from "./components/layout/AppLayout";

const queryClient = new QueryClient();

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// App routes with auth
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
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
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/sku-mapping" element={<SKUMappingPage />} />
        <Route path="/quotes" element={<QuotesPage />} />
        <Route path="/quotes/:id" element={<QuoteDetailPage />} />
        <Route path="/logistics" element={<LogisticsPage />} />
      </Route>
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
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
