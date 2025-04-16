import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Users, BookOpen, Sparkles, Github, Linkedin, Mail } from "lucide-react";
import DeveloperCard from "@/components/developers/DeveloperCard";
import ProjectCard from "@/components/projects/ProjectCard";

// Mock data for developers
const featuredDevs = [
  {
    id: "1",
    username: "johndoe",
    name: "John Doe",
    bio: "Full-stack developer specializing in React, Node.js, and GraphQL. Passionate about building accessible and performant web applications.",
    avatar: "https://github.com/shadcn.png",
    skills: ["React", "TypeScript", "Node.js", "GraphQL"],
    profileUrl: "/profile/johndoe",
    githubUrl: "https://github.com",
    websiteUrl: "https://example.com",
    linkedinUrl: "https://linkedin.com",
  },
  {
    id: "2",
    username: "janedoe",
    name: "Jane Doe",
    bio: "Frontend developer with a passion for UI/UX. Currently working on design systems and component libraries.",
    avatar: "https://github.com/shadcn.png",
    skills: ["React", "Vue", "CSS", "Figma", "UI Design"],
    profileUrl: "/profile/janedoe",
    githubUrl: "https://github.com",
  },
  {
    id: "3",
    username: "bobsmith",
    name: "Bob Smith",
    bio: "Backend engineer focused on system architecture and performance optimization. Love solving complex problems.",
    avatar: "https://github.com/shadcn.png",
    skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker"],
    profileUrl: "/profile/bobsmith",
    linkedinUrl: "https://linkedin.com",
  },
];

// Mock data for projects
const featuredProjects = [
  {
    id: "1",
    title: "Advanced AI Learning Platform",
    description: "Building an interactive learning platform with AI-powered tutoring and personalized learning paths.",
    techStack: ["React", "Python", "TensorFlow", "MongoDB"],
    status: "open" as const,
    owner: {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "https://github.com/shadcn.png",
      profileUrl: "/profile/johndoe",
    },
    projectUrl: "/projects/1",
    contributorsNeeded: ["UI/UX Designer", "ML Engineer", "Backend Developer"],
  },
  {
    id: "2",
    title: "Open-Source Design System",
    description: "Creating a comprehensive design system with components for React, Vue, and Svelte with theming support.",
    techStack: ["React", "Vue", "Svelte", "Tailwind CSS", "Storybook"],
    status: "open" as const,
    owner: {
      id: "2",
      name: "Jane Doe",
      username: "janedoe",
      avatar: "https://github.com/shadcn.png",
      profileUrl: "/profile/janedoe",
    },
    projectUrl: "/projects/2",
    contributorsNeeded: ["Frontend Developer", "Documentation Writer"],
  },
];

const features = [
  {
    icon: Users,
    title: "Connect with Developers",
    description: "Find developers with complementary skills to collaborate on projects or simply expand your professional network.",
  },
  {
    icon: BookOpen,
    title: "Find Exciting Projects",
    description: "Discover open-source projects that match your interests and skills, or post your own project ideas to find collaborators.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Matching",
    description: "Our smart algorithm suggests developers and projects that are most likely to be a good fit for your skills and interests.",
  },
];

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-devconnect-accent via-white to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-devconnect-purple/10 text-devconnect-purple text-sm font-medium mb-6">
              <Code size={16} className="mr-2" /> Developer Community Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Connect, Collaborate, and{" "}
              <span className="text-devconnect-purple">Grow</span> Together
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join a community of developers to find collaborators for projects, share ideas, and level up your career.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="font-medium">
                  Join DevConnect <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/projects">
                <Button size="lg" variant="outline" className="font-medium">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How DevConnect Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We've simplified the process of finding collaborators and projects that match your interests and skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-secondary/50 p-6 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="bg-devconnect-purple/10 p-3 rounded-full w-fit mb-4">
                  <feature.icon size={24} className="text-devconnect-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Developers */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Developers</h2>
            <Link to="/developers" className="text-devconnect-purple hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDevs.map((dev) => (
              <DeveloperCard key={dev.id} {...dev} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Projects</h2>
            <Link to="/projects" className="text-devconnect-purple hover:underline flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-devconnect-purple">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Ready to join the community?
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              Create your developer profile today and start connecting with other professionals.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="font-medium">
                <Github size={18} className="mr-2" /> Sign up with GitHub
              </Button>
              <Button size="lg" variant="secondary" className="font-medium">
                <Mail size={18} className="mr-2" /> Sign up with Email
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white font-medium hover:bg-white/10">
                <Link to="/register">Register with Email</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
