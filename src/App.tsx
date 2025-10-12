import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import DeliveryInstall from "./pages/DeliveryInstall";
import Maintenance from "./pages/Maintenance";
import Sales from "./pages/Sales";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import NotFound from "./pages/NotFound";
import DeliveryInstallDetail from "./pages/DeliveryInstallDetail";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import SalesSupportDetail from "./pages/SalesSupportDetail";
import ScrollUnlock from "@/components/ScrollUnlock";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollUnlock />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/delivery-install" element={<DeliveryInstall />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/delivery-install/:id" element={<DeliveryInstallDetail />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetail />} />
          <Route path="/sales/:id" element={<SalesSupportDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
