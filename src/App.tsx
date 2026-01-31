import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import AgentProfile from "./pages/AgentProfile";
import Briefings from "./pages/Briefings";
import BriefingDetail from "./pages/BriefingDetail";
import Analytics from "./pages/Analytics";
import Lineage from "./pages/Lineage";
import Museum from "./pages/Museum";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import Maintenance from "./pages/Maintenance";
import Admin from "./pages/Admin";

// EMERGENCY MAINTENANCE MODE
// Set to false when ready to restore normal operation
// Disabled - using EMERGENCY_MINIMAL_MODE in Index.tsx instead
const MAINTENANCE_MODE = false;

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {MAINTENANCE_MODE ? (
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<Maintenance />} />
            </Routes>
          ) : (
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentProfile />} />
              <Route path="/briefings" element={<Briefings />} />
              <Route path="/briefings/:id" element={<BriefingDetail />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/lineage" element={<Lineage />} />
              <Route path="/museum" element={<Museum />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
