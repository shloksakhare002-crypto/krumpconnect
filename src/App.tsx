import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "./providers/Web3Provider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Sessions from "./pages/Sessions";
import ManageSessions from "./pages/ManageSessions";
import Fams from "./pages/Fams";
import FamDetail from "./pages/FamDetail";
import Events from "./pages/Events";
import Battles from "./pages/Battles";
import NotFound from "./pages/NotFound";

const App = () => (
  <Web3Provider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:profileId" element={<PublicProfile />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/manage-sessions" element={<ManageSessions />} />
          <Route path="/fams" element={<Fams />} />
          <Route path="/fams/:slug" element={<FamDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/battles" element={<Battles />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </Web3Provider>
);

export default App;
