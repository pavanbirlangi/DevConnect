import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Github, ExternalLink, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  status: "open" | "closed";
  owner_id: string;
  created_at: string;
  contributors_needed?: string[];
  github_url?: string;
  live_url?: string;
  owner?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!owner_id(id, name, username, avatar)
        `)
        .eq("id", projectId)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error("Project not found");
        return;
      }

      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-8">The project you're looking for doesn't exist or has been removed.</p>
        <Link to="/projects">
          <Button>
            <ArrowLeft size={16} className="mr-2" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="mb-6">
        <Link to="/projects" className="text-sm text-devconnect-purple flex items-center hover:underline">
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </Link>
      </div>

      {/* Project Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <Badge variant={project.status === "open" ? "default" : "secondary"} className="ml-2">
              {project.status === "open" ? "Open to Contributors" : "Closed"}
            </Badge>
          </div>
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
            <span className="mx-2">•</span>
            <Link to={`/profile/${project.owner?.username}`} className="flex items-center hover:text-devconnect-purple">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarImage src={project.owner?.avatar} />
                <AvatarFallback>{project.owner?.name?.[0]}</AvatarFallback>
              </Avatar>
              {project.owner?.name}
            </Link>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {project.github_url && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <Github size={16} className="mr-2" /> Repository
              </Button>
            </a>
          )}
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink size={16} className="mr-2" /> Live Demo
              </Button>
            </a>
          )}
          <Button size="sm">
            <MessageCircle size={16} className="mr-2" /> Contact Owner
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">About This Project</h2>
              <p className="mb-4">{project.description}</p>

              <h3 className="text-lg font-medium mt-6 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tech_stack.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Contributors Needed */}
          {project.status === "open" && project.contributors_needed && project.contributors_needed.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-3">Contributors Needed</h2>
                <div className="space-y-2">
                  {project.contributors_needed.map((role) => (
                    <div key={role} className="border rounded-md p-3 flex justify-between items-center">
                      <span>{role}</span>
                      <Button size="sm" variant="outline">Apply</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Info */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-3">Project Owner</h2>
              <Link 
                to={`/profile/${project.owner?.username}`}
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary transition-colors"
              >
                <Avatar>
                  <AvatarImage src={project.owner?.avatar} />
                  <AvatarFallback>{project.owner?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{project.owner?.name}</div>
                  <div className="text-sm text-muted-foreground">@{project.owner?.username}</div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;