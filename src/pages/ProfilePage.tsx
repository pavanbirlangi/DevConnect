import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Globe, Linkedin, MapPin, Mail, MessageSquare, UserPlus, Users, X } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';


interface Profile {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
  skills: string[];
  githubUrl: string;
  websiteUrl: string;
  linkedinUrl: string;
}

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

interface ProfilePayload {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatar: string;
  location: string;
  email: string;
  skills: string[];
  github_url: string;
  website_url: string;
  linkedin_url: string;
}

const ProfilePage = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending' | 'connected'>('none');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileAndProjects();
  }, [username]);

  useEffect(() => {
    if (user && profile && user.id !== profile.id) {
      checkConnectionStatus();
    }
  }, [user?.id, profile?.id]);

  // Add real-time subscriptions
  useEffect(() => {
    if (!profile?.id) return;

    // Create a single channel for all subscriptions
    const channel = supabase.channel('profile-updates');

    // Subscribe to profile changes
    channel
      .on<ProfilePayload>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profile.id}`,
        },
        async (payload: RealtimePostgresChangesPayload<ProfilePayload>) => {
          console.log('Profile change received:', payload);
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as ProfilePayload;
            const updatedProfile: Profile = {
              id: newData.id,
              username: newData.username,
              name: newData.name || "Unknown User",
              bio: newData.bio || "No bio available",
              avatar: newData.avatar || "https://github.com/shadcn.png",
              location: newData.location || "Location not specified",
              email: newData.email || "",
              skills: newData.skills || [],
              githubUrl: newData.github_url || "",
              websiteUrl: newData.website_url || "",
              linkedinUrl: newData.linkedin_url || "",
            };
            setProfile(updatedProfile);
          }
          await fetchProfileAndProjects();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `or(and(user_id.eq.${user?.id},connected_user_id.eq.${profile.id}),and(user_id.eq.${profile.id},connected_user_id.eq.${user?.id}))`,
        },
        async (payload) => {
          console.log('Connection change received:', payload);
          await checkConnectionStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connection_requests',
          filter: `or(and(sender_id.eq.${user?.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user?.id}))`,
        },
        async (payload) => {
          console.log('Request change received:', payload);
          await checkConnectionStatus();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription
    return () => {
      channel.unsubscribe();
    };
  }, [profile?.id, user?.id]);

  // Add a separate effect to handle initial data loading
  useEffect(() => {
    if (profile?.id) {
      fetchProfileAndProjects();
      checkConnectionStatus();
    }
  }, [profile?.id]);

  const checkConnectionStatus = async () => {
    if (!user || !profile) return;

    try {
      // Check for pending request
      const { data: pendingRequest, error: pendingError } = await supabase
        .from('connection_requests')
        .select('*')
        .eq('sender_id', user.id)
        .eq('receiver_id', profile.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingError) {
        console.error('Error checking pending request:', pendingError);
        return;
      }

      if (pendingRequest) {
        setConnectionStatus('pending');
        setPendingRequestId(pendingRequest.id);
        return;
      }

      // Check for existing connection in both directions
      const { data: connections, error: connectionError } = await supabase
        .from('connections')
        .select('*')
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${profile.id}),and(user_id.eq.${profile.id},connected_user_id.eq.${user.id})`);

      if (connectionError) {
        console.error('Error checking connection:', connectionError);
        return;
      }

      if (connections && connections.length > 0) {
        setConnectionStatus('connected');
        return;
      }

      // If no pending request and no connection, set status to none
      setConnectionStatus('none');
      setPendingRequestId(null);
    } catch (error) {
      console.error('Error checking connection status:', error);
      // In case of error, set status to none to allow reconnecting
      setConnectionStatus('none');
      setPendingRequestId(null);
    }
  };

  const handleConnect = async () => {
    if (!user || !profile) return;

    try {
      // Create a new request directly
      const { data, error } = await supabase
        .from('connection_requests')
        .insert({
          sender_id: user.id,
          receiver_id: profile.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        // If there's a unique constraint error, try to delete any existing requests first
        if (error.code === '23505') {
          // Delete any existing requests
          await supabase
            .from('connection_requests')
            .delete()
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user.id})`);
          
          // Try to create the request again
          const { data: retryData, error: retryError } = await supabase
            .from('connection_requests')
            .insert({
              sender_id: user.id,
              receiver_id: profile.id,
              status: 'pending'
            })
            .select()
            .single();
            
          if (retryError) throw retryError;
          
          setConnectionStatus('pending');
          setPendingRequestId(retryData.id);
          toast.success('Connection request sent successfully');
          return;
        }
        throw error;
      }

      setConnectionStatus('pending');
      setPendingRequestId(data.id);
      toast.success('Connection request sent successfully');
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    }
  };

  const handleWithdrawRequest = async () => {
    if (!pendingRequestId || !user || !profile) return;

    try {
      // Delete the request directly
      const { error: deleteError } = await supabase
        .from('connection_requests')
        .delete()
        .eq('id', pendingRequestId)
        .eq('sender_id', user.id);

      if (deleteError) {
        console.error('Error deleting request:', deleteError);
        throw deleteError;
      }

      // Update local state
      setConnectionStatus('none');
      setPendingRequestId(null);

      toast.success("Your connection request has been withdrawn.");
    } catch (error) {
      console.error('Error withdrawing request:', error);
      toast.error("Failed to withdraw connection request");
    }
  };

  const fetchProfileAndProjects = async () => {
    try {
      setLoading(true);
      
      let profileQuery = supabase
        .from("profiles")
        .select("*");

      // If username is "me", fetch the current user's profile
      if (username === "me") {
        if (!user) {
          toast.error("Please sign in to view your profile");
          setProfile(null);
          setProjects([]);
          return;
        }
        profileQuery = profileQuery.eq("id", user.id);
      } else {
        profileQuery = profileQuery.eq("username", username);
      }

      const { data: profileData, error: profileError } = await profileQuery.single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile not found
          setProfile(null);
          setProjects([]);
          return;
        }
        throw profileError;
      }
      
      // Transform profile data to match our interface
      const transformedProfile: Profile = {
        id: profileData.id,
        username: profileData.username,
        name: profileData.name || "Unknown User",
        bio: profileData.bio || "No bio available",
        avatar: profileData.avatar || "https://github.com/shadcn.png",
        location: profileData.location || "Location not specified",
        email: profileData.email || "",
        skills: profileData.skills || [],
        githubUrl: profileData.github_url || "",
        websiteUrl: profileData.website_url || "",
        linkedinUrl: profileData.linkedin_url || "",
      };
      
      setProfile(transformedProfile);

      // Fetch user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select(`
          *,
          owner:profiles!owner_id(id, name, username, avatar)
        `)
        .eq("owner_id", profileData.id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;
      
      setProjects(projectsData || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
      setProfile(null);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
            </Avatar>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              <div className="space-y-4">
                {profile.bio && (
                  <p className="text-sm">{profile.bio}</p>
                )}

                <div className="space-y-2">
                  {profile.location && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin size={16} className="mr-2" />
                      {profile.location}
              </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail size={16} className="mr-2" />
                      {profile.email}
            </div>
                  )}
            </div>

                {profile.skills.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="tech-tag">
                    {skill}
                  </span>
                ))}
              </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {profile.githubUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github size={18} />
                      </a>
                    </Button>
                  )}
                  {profile.websiteUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <Globe size={18} />
                      </a>
                    </Button>
                  )}
                  {profile.linkedinUrl && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin size={18} />
                      </a>
                    </Button>
                  )}
                </div>

                {user?.id === profile.id ? (
                  <>
                    <Link to="/connections" className="w-full">
                      <Button variant="outline" className="w-full">
                        <Users size={16} className="mr-2" /> Manage Connections
                      </Button>
                    </Link>
                    <Button className="w-full" variant="outline" onClick={() => navigate("/profile/edit")}>
                      <MessageSquare size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    {connectionStatus === 'pending' ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={handleWithdrawRequest}
                      >
                        <X size={16} className="mr-2" /> Withdraw Request
                      </Button>
                    ) : connectionStatus === 'none' ? (
                      <Button 
                        className="w-full" 
                        onClick={handleConnect}
                      >
                        <UserPlus size={16} className="mr-2" /> Connect
                      </Button>
                    ) : null}
                    <Button variant="outline" className="w-full">
                      <MessageSquare size={16} className="mr-2" /> Message
                    </Button>
                  </>
                )}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects">
            <TabsList className="mb-8">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="contributions">Contributions</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Projects</h2>
                {user?.id === profile.id && (
                  <Button asChild>
                    <a href="/projects/create">Create New Project</a>
                  </Button>
                )}
              </div>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      id={project.id}
                      title={project.title}
                      description={project.description}
                      techStack={project.tech_stack}
                      status={project.status}
                      owner={{
                        id: project.owner?.id || profile.id,
                        name: project.owner?.name || profile.name,
                        username: project.owner?.username || profile.username,
                        avatar: project.owner?.avatar || profile.avatar,
                        profileUrl: `/profile/${project.owner?.username || profile.username}`,
                      }}
                      projectUrl={`/projects/${project.id}`}
                      contributorsNeeded={project.contributors_needed}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No projects yet.</p>
                  {user?.id === profile.id && (
                    <Button className="mt-4" asChild>
                      <a href="/projects/create">Create Your First Project</a>
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="contributions">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Contributions</h2>
                <p className="text-muted-foreground">
                  This section will display projects this developer has contributed to.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-2">Activity</h2>
                <p className="text-muted-foreground">
                  This section will display recent activity from this developer.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
