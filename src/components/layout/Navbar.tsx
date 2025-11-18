import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              Krump India
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/sessions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sessions
            </Link>
            <Link to="/fams" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Fams
            </Link>
            <Link to="/events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Events
            </Link>
            <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </div>

          {/* Wallet Connect */}
          <div className="hidden md:block">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              to="/sessions"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sessions
            </Link>
            <Link
              to="/fams"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fams
            </Link>
            <Link
              to="/events"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              to="/profile"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="pt-2">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
