import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Code } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Developer {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  skills: string[];
  github_url: string;
  website_url: string;
  linkedin_url: string;
}

const DevelopersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchTerm, selectedSkills, developers]);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (error) throw error;

      // Filter out the current user
      const filteredData = user 
        ? data.filter(dev => dev.id !== user.id)
        : data;

      // Extract all unique skills
      const skills = new Set<string>();
      filteredData.forEach((dev) => {
        if (dev.skills) {
          dev.skills.forEach((skill) => skills.add(skill));
        }
      });
      setAllSkills(Array.from(skills).sort());

      setDevelopers(filteredData);
      setFilteredDevelopers(filteredData);
    } catch (error) {
      console.error("Error fetching developers:", error);
      toast.error("Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    let filtered = [...developers];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dev) =>
          dev.name.toLowerCase().includes(term) ||
          dev.username.toLowerCase().includes(term) ||
          dev.bio?.toLowerCase().includes(term) ||
          dev.skills?.some((skill) => skill.toLowerCase().includes(term))
      );
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((dev) =>
        selectedSkills.every((skill) => dev.skills?.includes(skill))
      );
    }

    setFilteredDevelopers(filtered);
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">Developers</h1>
          <p className="text-muted-foreground">
            Discover talented developers and connect with them for collaboration.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search developers by name, username, or skills..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {allSkills.map((skill) => (
            <Badge
              key={skill}
              variant={selectedSkills.includes(skill) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSkill(skill)}
            >
              {skill}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopers.map((developer) => (
            <Card
              key={developer.id}
              className="hover:shadow-md transition-shadow flex flex-col"
            >
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={developer.avatar} />
                    <AvatarFallback>{developer.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{developer.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      @{developer.username}
                    </p>
                    {developer.location && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span className="truncate">{developer.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {developer.bio && (
                  <p className="mt-4 text-sm line-clamp-2">{developer.bio}</p>
                )}

                {developer.skills && developer.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {developer.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {developer.skills.length > 3 && (
                      <Badge variant="outline">+{developer.skills.length - 3} more</Badge>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Code size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {developer.skills?.length || 0} skills
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border border-border hover:border-primary"
                    onClick={() => navigate(`/profile/${developer.username}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No developers found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopersPage; 