
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Globe, Linkedin } from "lucide-react";

interface DeveloperCardProps {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  skills: string[];
  profileUrl: string;
  githubUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
}

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  id,
  username,
  name,
  bio,
  avatar,
  skills,
  profileUrl,
  githubUrl,
  websiteUrl,
  linkedinUrl,
}) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between">
          <Avatar className="h-12 w-12 border-2 border-devconnect-purple">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex space-x-2">
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-devconnect-purple transition-colors"
              >
                <Github size={18} />
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-devconnect-purple transition-colors"
              >
                <Globe size={18} />
              </a>
            )}
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-devconnect-purple transition-colors"
              >
                <Linkedin size={18} />
              </a>
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>
      </CardHeader>
      <CardContent className="py-4 flex-grow">
        <p className="text-sm line-clamp-3">{bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill) => (
            <span key={skill} className="tech-tag">
              {skill}
            </span>
          ))}
          {skills.length > 4 && (
            <span className="tech-tag">+{skills.length - 4}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link to={profileUrl} className="w-full">
          <Button variant="outline" className="w-full">
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DeveloperCard;
