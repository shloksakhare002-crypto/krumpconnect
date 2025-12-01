import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Menu, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccount, useSwitchChain } from "wagmi";
import { storyTestnet, storyMainnet } from "@/config/web3";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleNetworkChange = (value: string) => {
    const chainId = parseInt(value);
    switchChain({ chainId });
  };

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
            <Link to="/battles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Battles
            </Link>
            <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Select value={chain?.id?.toString()} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={storyTestnet.id.toString()}>
                  {storyTestnet.name}
                </SelectItem>
                <SelectItem value={storyMainnet.id.toString()}>
                  {storyMainnet.name}
                </SelectItem>
              </SelectContent>
            </Select>
            <ConnectButton />
            {user && (
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                <LogOut className="h-4 w-4" />
              </Button>
            )}
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
              to="/battles"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Battles
            </Link>
            <Link
              to="/profile"
              className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <div className="pt-2 space-y-4">
              <Select value={chain?.id?.toString()} onValueChange={handleNetworkChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={storyTestnet.id.toString()}>
                    {storyTestnet.name}
                  </SelectItem>
                  <SelectItem value={storyMainnet.id.toString()}>
                    {storyMainnet.name}
                  </SelectItem>
                </SelectContent>
              </Select>
              <ConnectButton />
              {user && (
                <Button variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
