import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import AuditorDashboard from "./pages/AuditorDashboard";
import ProcurementDashboard from "./pages/ProcurementDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public chat - no login required */}
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
            
            {/* Authentication */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected dashboards */}
            <Route path="/auditor" element={<AuditorDashboard />} />
            <Route path="/procurement" element={<ProcurementDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
