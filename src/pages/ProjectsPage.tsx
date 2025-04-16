import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Filter } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

// Tech options for filter
const techOptions = [
  "React", "Vue", "Svelte", "JavaScript", "TypeScript",
  "Node.js", "Python", "Django", "Ruby", "Rails",
  "GraphQL", "REST", "MongoDB", "PostgreSQL", "Firebase",
  "AWS", "Docker", "Kubernetes", "CI/CD"
];

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  status: "open" | "closed";
  owner_id: string;
  created_at: string;
  contributors_needed?: string[];
  owner?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with owner information
      const { data, error } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!owner_id(id, name, username, avatar)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
      
      // Transform the data to handle missing profiles
      const transformedData = data?.map(project => ({
        ...project,
        owner: project.owner || {
          id: project.owner_id,
          name: "Unknown User",
          username: "unknown",
          avatar: "https://github.com/shadcn.png"
        }
      })) || [];
      
      setProjects(transformedData);
    } catch (error) {
      console.error("Error in fetchProjects:", error);
      toast({
        title: "Error fetching projects",
        description: error instanceof Error ? error.message : "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePostProject = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post a project",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    navigate("/projects/create");
  };

  const toggleTechFilter = (tech: string) => {
    if (selectedTech.includes(tech)) {
      setSelectedTech(selectedTech.filter(t => t !== tech));
    } else {
      setSelectedTech([...selectedTech, tech]);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedTech([]);
  };

  const filteredProjects = projects
    .filter(project => {
      if (statusFilter === "open") return project.status === "open";
      if (statusFilter === "closed") return project.status === "closed";
      return true;
    })
    .filter(project => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(search) ||
        project.description.toLowerCase().includes(search) ||
        project.tech_stack.some(tech => tech.toLowerCase().includes(search))
      );
    })
    .filter(project => {
      if (selectedTech.length === 0) return true;
      return selectedTech.some(tech => 
        project.tech_stack.some(t => t.toLowerCase() === tech.toLowerCase())
      );
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Find projects to contribute to or create your own</p>
        </div>
        <Button className="mt-4 md:mt-0" onClick={handlePostProject}>
          <PlusCircle size={16} className="mr-2" /> Post a Project
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open Only</SelectItem>
              <SelectItem value="closed">Closed Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter size={16} className="mr-2" /> Tech Stack
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h3 className="font-medium">Filter by Technology</h3>
                <div className="grid grid-cols-2 gap-2">
                  {techOptions.slice(0, 8).map((tech) => (
                    <div key={tech} className="flex items-center space-x-2">
                      <Checkbox 
                        id={tech} 
                        checked={selectedTech.includes(tech)}
                        onCheckedChange={() => toggleTechFilter(tech)}
                      />
                      <Label htmlFor={tech}>{tech}</Label>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="link" className="px-0">
                  Show more technologies
                </Button>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                  <Button size="sm" onClick={() => {}}>Apply Filters</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              id={project.id}
              title={project.title}
              description={project.description}
              techStack={project.tech_stack}
              status={project.status}
              owner={{
                id: project.owner?.id || "",
                name: project.owner?.name || "Unknown",
                username: project.owner?.username || "unknown",
                avatar: project.owner?.avatar || "https://github.com/shadcn.png",
                profileUrl: `/profile/${project.owner?.username || "unknown"}`,
              }}
              projectUrl={`/projects/${project.id}`}
              contributorsNeeded={project.contributors_needed}
            />
          ))}
        </div>
      )}

      {/* Empty state if no projects match filters */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-16">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search or filter criteria
          </p>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
