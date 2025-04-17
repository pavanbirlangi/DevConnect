import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X, Code, User, PanelRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Developers", href: "/developers" },
    { name: "Projects", href: "/projects" },
  ];

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Code size={28} className="text-devconnect-purple" />
          <span className="font-bold text-xl">DevConnect</span>
        </Link>
        
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Navigate through the application
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-6">
                {navLinks.map((link) => (
                  <SheetClose asChild key={link.name}>
                    <Link
                      to={link.href}
                      className="flex px-4 py-2 hover:bg-accent rounded-md transition-colors"
                    >
                      {link.name}
                    </Link>
                  </SheetClose>
                ))}
                
                <div className="border-t border-border pt-4 mt-4">
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link to="/profile/me" className="flex px-4 py-2 hover:bg-accent rounded-md transition-colors">
                          <User size={18} className="mr-2" /> My Profile
                        </Link>
                      </SheetClose>
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full mt-2"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <SheetClose asChild>
                        <Link to="/login">
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/register">
                          <Button className="w-full mt-2">Register</Button>
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground/80 hover:text-devconnect-purple-dark transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile/me">
                  <Button variant="ghost" size="icon">
                    <User size={20} />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
