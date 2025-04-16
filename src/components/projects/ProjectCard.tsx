
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: "open" | "closed";
  owner: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    profileUrl: string;
  };
  projectUrl: string;
  contributorsNeeded?: string[];
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  techStack,
  status,
  owner,
  projectUrl,
  contributorsNeeded = [],
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{title}</h3>
          <Badge variant={status === "open" ? "default" : "secondary"}>
            {status === "open" ? "Open" : "Closed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm line-clamp-3 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {techStack.slice(0, 3).map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
          {techStack.length > 3 && (
            <span className="tech-tag">+{techStack.length - 3}</span>
          )}
        </div>
        {contributorsNeeded.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground mb-1">Looking for:</p>
            <div className="flex flex-wrap gap-1">
              {contributorsNeeded.map((role) => (
                <Badge key={role} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <Link to={owner.profileUrl} className="flex items-center space-x-2 group">
          <Avatar className="h-6 w-6">
            <AvatarImage src={owner.avatar} alt={owner.name} />
            <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground group-hover:text-devconnect-purple transition-colors">
            @{owner.username}
          </span>
        </Link>
        <Link to={projectUrl}>
          <Button size="sm" variant="outline">
            View Project
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
