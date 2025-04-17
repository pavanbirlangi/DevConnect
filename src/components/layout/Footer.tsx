import React from "react";
import { Link } from "react-router-dom";
import { Code, Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <Code size={24} className="text-devconnect-purple" />
              <span className="font-bold text-xl">DevConnect</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Connect, collaborate, and grow with other developers around the world.
            </p>
            <div className="flex mt-4 space-x-4">
              <a
                href="#"
                className="text-foreground/70 hover:text-devconnect-purple-dark transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="text-foreground/70 hover:text-devconnect-purple-dark transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="text-foreground/70 hover:text-devconnect-purple-dark transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/developers"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Developers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-devconnect-purple-dark transition-colors"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DevConnect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
