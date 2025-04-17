import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Check, X, UserPlus, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  sender?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  receiver?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

interface Connection {
  id: string;
  user_id: string;
  connected_user_id: string;
  created_at: string;
  connected_user?: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
}

const ConnectionsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnectionData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchConnectionData = async () => {
    try {
      setLoading(true);
      
      // Fetch received connection requests
      const { data: receivedRequests, error: receivedError } = await supabase
        .from("connection_requests")
        .select(`
          *,
          sender:profiles!sender_id(id, name, username, avatar)
        `)
        .eq("receiver_id", user?.id)
        .eq("status", "pending");
      
      if (receivedError) throw receivedError;
      
      // Fetch sent connection requests
      const { data: sentRequestsData, error: sentError } = await supabase
        .from("connection_requests")
        .select(`
          *,
          receiver:profiles!receiver_id(id, name, username, avatar)
        `)
        .eq("sender_id", user?.id)
        .eq("status", "pending");
      
      if (sentError) throw sentError;
      
      // Fetch connections
      const { data: connectionsData, error: connectionsError } = await supabase
        .from("connections")
        .select(`
          *,
          connected_user:profiles!connected_user_id(id, name, username, avatar)
        `)
        .eq("user_id", user?.id);
      
      if (connectionsError) throw connectionsError;
      
      setConnectionRequests(receivedRequests || []);
      setSentRequests(sentRequestsData || []);
      setConnections(connectionsData || []);
    } catch (error) {
      console.error("Error fetching connection data:", error);
      toast({
        title: "Error",
        description: "Failed to load connection data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);
      
      if (error) throw error;
      
      // Refresh data
      fetchConnectionData();
      
      toast({
        title: "Connection request accepted",
        description: "You are now connected with this developer.",
      });
    } catch (error) {
      console.error("Error accepting request:", error);
      toast({
        title: "Error",
        description: "Failed to accept connection request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("connection_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);
      
      if (error) throw error;
      
      // Refresh data
      fetchConnectionData();
      
      toast({
        title: "Connection request rejected",
      });
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast({
        title: "Error",
        description: "Failed to reject connection request",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      // First, update the status to 'withdrawn'
      const { error: updateError } = await supabase
        .from("connection_requests")
        .update({ status: 'withdrawn' })
        .eq("id", requestId);
      
      if (updateError) throw updateError;
      
      // Then delete the request
      const { error: deleteError } = await supabase
        .from("connection_requests")
        .delete()
        .eq("id", requestId);
      
      if (deleteError) throw deleteError;
      
      // Refresh data
      fetchConnectionData();
      
      toast({
        title: "Connection request cancelled",
        description: "Your connection request has been withdrawn.",
      });
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel connection request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveConnection = async (connectionId: string) => {
    try {
      // First, get the connection details to find both user IDs
      const { data: connection, error: fetchError } = await supabase
        .from("connections")
        .select("*")
        .eq("id", connectionId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete both connections (bidirectional)
      const { error: deleteError } = await supabase
        .from("connections")
        .delete()
        .or(`and(user_id.eq.${connection.user_id},connected_user_id.eq.${connection.connected_user_id}),and(user_id.eq.${connection.connected_user_id},connected_user_id.eq.${connection.user_id})`);
      
      if (deleteError) throw deleteError;
      
      // Refresh data
      fetchConnectionData();
      
      toast({
        title: "Connection removed",
        description: "You have successfully removed this connection.",
      });
    } catch (error) {
      console.error("Error removing connection:", error);
      toast({
        title: "Error",
        description: "Failed to remove connection",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to view and manage your connections.
          </p>
          <Button asChild>
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Manage Connections</h1>
        <Button className="flex items-center" asChild>
          <Link to="/developers">
            <UserPlus className="mr-2 h-4 w-4" />
            Find People
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="requests" className="flex items-center">
            Requests
            {connectionRequests.length > 0 && (
              <span className="ml-2 bg-devconnect-purple text-white rounded-full px-2 py-0.5 text-xs">
                {connectionRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="connections" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableCaption>
                {connectionRequests.length ? 
                  "A list of people who want to connect with you." : 
                  "You have no connection requests at this time."}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectionRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      No pending connection requests
                    </TableCell>
                  </TableRow>
                ) : (
                  connectionRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Link to={`/profile/${request.sender?.username}`} className="flex items-center space-x-3 hover:underline">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.sender?.avatar} alt={request.sender?.name} />
                            <AvatarFallback>{request.sender?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.sender?.name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">@{request.sender?.username || 'unknown'}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleRejectRequest(request.id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="sent">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableCaption>
                {sentRequests.length ?
                  "A list of connection requests you have sent." :
                  "You haven't sent any connection requests."}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      You haven't sent any connection requests
                    </TableCell>
                  </TableRow>
                ) : (
                  sentRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Link to={`/profile/${request.receiver?.username}`} className="flex items-center space-x-3 hover:underline">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={request.receiver?.avatar} alt={request.receiver?.name} />
                            <AvatarFallback>{request.receiver?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.receiver?.name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">@{request.receiver?.username || 'unknown'}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="connections">
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableCaption>
                {connections.length ?
                  "A list of your connections." :
                  "You don't have any connections yet."}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Developer</TableHead>
                  <TableHead>Connected Since</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      You don't have any connections yet
                    </TableCell>
                  </TableRow>
                ) : (
                  connections.map((connection) => (
                    <TableRow key={connection.id}>
                      <TableCell className="flex items-center space-x-3">
                        <Link to={`/profile/${connection.connected_user?.username}`} className="flex items-center space-x-3 hover:underline">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={connection.connected_user?.avatar} alt={connection.connected_user?.name} />
                            <AvatarFallback>{connection.connected_user?.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{connection.connected_user?.name || 'Unknown User'}</div>
                            <div className="text-sm text-muted-foreground">@{connection.connected_user?.username || 'unknown'}</div>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(connection.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          onClick={() => handleRemoveConnection(connection.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionsPage;