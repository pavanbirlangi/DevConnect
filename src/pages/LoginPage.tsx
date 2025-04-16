import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Github, Linkedin } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Login successful!",
        description: "Welcome back to DevConnect.",
      });
      
      // Redirect to home page after successful login
      navigate("/");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-devconnect-accent via-white to-white p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to="/" className="flex items-center space-x-2">
            <Code size={32} className="text-devconnect-purple" />
            <span className="font-bold text-2xl">DevConnect</span>
          </Link>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full" type="button">
                    <Github className="mr-2 h-4 w-4" /> GitHub
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
                    <Linkedin className="mr-2 h-4 w-4" /> LinkedIn
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-devconnect-purple hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">Login</Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-devconnect-purple hover:underline">
                    Register
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
