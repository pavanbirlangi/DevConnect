import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ProjectFormData {
  title: string;
  description: string;
  status: "open" | "closed";
  tech_stack: string[];
  github_url: string;
  live_url: string;
  contributors_needed: string[];
}

const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: "",
    description: "",
    status: "open",
    tech_stack: [],
    github_url: "",
    live_url: "",
    contributors_needed: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a project");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            ...formData,
            owner_id: user.id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Project created successfully!");
      navigate("/projects");
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTechStackChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tech_stack: value.split(",").map((tech) => tech.trim()),
    }));
  };

  const handleContributorsChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      contributors_needed: value.split(",").map((role) => role.trim()),
    }));
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter project title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            required
            placeholder="Describe your project"
            className="min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "open" | "closed") => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select project status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tech_stack">Technology Stack (comma-separated)</Label>
          <Input
            id="tech_stack"
            value={formData.tech_stack.join(", ")}
            onChange={(e) => handleTechStackChange(e.target.value)}
            placeholder="React, TypeScript, Node.js"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contributors_needed">Contributors Needed (comma-separated)</Label>
          <Input
            id="contributors_needed"
            value={formData.contributors_needed.join(", ")}
            onChange={(e) => handleContributorsChange(e.target.value)}
            placeholder="Frontend Developer, UI Designer, Backend Developer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github_url">GitHub URL</Label>
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, github_url: e.target.value }))}
            placeholder="https://github.com/username/repo"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="live_url">Live URL</Label>
          <Input
            id="live_url"
            type="url"
            value={formData.live_url}
            onChange={(e) => setFormData((prev) => ({ ...prev, live_url: e.target.value }))}
            placeholder="https://your-project.com"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/projects")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage; 