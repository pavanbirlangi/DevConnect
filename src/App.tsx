import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/layout/Layout";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from "./contexts/AuthContext";
import CreateProjectPage from "@/pages/CreateProjectPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import EditProfilePage from "@/pages/EditProfilePage";
import DevelopersPage from "@/pages/DevelopersPage";
import ConnectionsPage from "@/pages/ConnectionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/profile/:username" element={<Layout><ProfilePage /></Layout>} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/connections" element={<Layout><ConnectionsPage /></Layout>} />
            <Route path="/developers" element={<Layout><DevelopersPage /></Layout>} />
            <Route path="/projects" element={<Layout><ProjectsPage /></Layout>} />
            <Route path="/projects/:projectId" element={<Layout><ProjectDetailPage /></Layout>} />
            <Route path="/projects/create" element={<Layout><CreateProjectPage /></Layout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
