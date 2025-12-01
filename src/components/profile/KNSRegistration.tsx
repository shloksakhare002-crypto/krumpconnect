import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useWriteContract, useSwitchChain, useChainId } from "wagmi";
import { Shield, Check, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { storyTestnet } from "@/config/web3";

interface KNSRegistrationProps {
  profileId: string;
  currentKrumpName?: string;
  worldIdVerified: boolean;
  onNameRegistered: (name: string) => void;
}

export const KNSRegistration = ({
  profileId,
  currentKrumpName,
  worldIdVerified,
  onNameRegistered,
}: KNSRegistrationProps) => {
  const [krumpName, setKrumpName] = useState(currentKrumpName || "");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [registering, setRegistering] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();

  const checkAvailability = async () => {
    if (!krumpName.trim()) return;

    setChecking(true);
    try {
      // Check if name is already taken in database
      const { data, error } = await supabase
        .from("profiles")
        .select("krump_name")
        .eq("krump_name", krumpName)
        .neq("id", profileId);

      if (error) throw error;

      setAvailable(data.length === 0);
    } catch (error: any) {
      toast({
        title: "Error checking availability",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleRegister = async () => {
    if (!address || !worldIdVerified || !krumpName.trim()) return;

    // Switch to Story Testnet if not already
    if (chainId !== storyTestnet.id) {
      try {
        await switchChain({ chainId: storyTestnet.id });
      } catch (error: any) {
        toast({
          title: "Network Switch Required",
          description: "Please switch to Story Testnet to register your KNS",
          variant: "destructive",
        });
        return;
      }
    }

    setRegistering(true);
    try {
      // Update profile with krump_name
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          krump_name: krumpName,
        })
        .eq("id", profileId);

      if (updateError) throw updateError;

      toast({
        title: "KNS Registered! 🎉",
        description: `Your Krump Name "${krumpName}.krump" has been registered`,
      });

      onNameRegistered(krumpName);
      setAvailable(null);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Krump Name System (KNS)
        </CardTitle>
        <CardDescription>
          Claim your unique .krump identity on Story Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentKrumpName ? (
          <div className="space-y-3">
            <div className="p-4 bg-gradient-card rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Your KNS Identity</p>
                <Badge variant="outline" className="border-primary text-primary">
                  <Check className="h-3 w-3 mr-1" />
                  Registered
                </Badge>
              </div>
              <p className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                {currentKrumpName}.krump
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Decentralized identity on Story Protocol</p>
              <p>✓ Verifiable ownership linked to wallet</p>
              <p>✓ Permanent record on-chain</p>
            </div>

            <Button variant="outline" size="sm" className="w-full" asChild>
              <a
                href={`https://aeneid.explorer.story.foundation/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!worldIdVerified ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-destructive">World ID Required</p>
                    <p className="text-muted-foreground">
                      Verify with World ID to register your Krump Name
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="krump-name-kns">Choose Your Krump Name</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        id="krump-name-kns"
                        value={krumpName}
                        onChange={(e) => {
                          setKrumpName(e.target.value);
                          setAvailable(null);
                        }}
                        placeholder="LilBeast"
                        className="pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        .krump
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={checkAvailability}
                      disabled={!krumpName.trim() || checking}
                    >
                      {checking ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Check"
                      )}
                    </Button>
                  </div>
                  
                  {available === true && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      <span>{krumpName}.krump is available!</span>
                    </div>
                  )}
                  {available === false && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{krumpName}.krump is already taken</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                  <p className="font-semibold text-foreground mb-1">How KNS Works:</p>
                  <p>• Choose a unique name (e.g., "LilBeast" → "LilBeast.krump")</p>
                  <p>• Your name is registered on Story Protocol blockchain</p>
                  <p>• Acts as your verifiable Krump identity across the platform</p>
                  <p>• Cannot be changed once registered</p>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={!available || registering}
                  className="w-full"
                  variant="web3"
                >
                  {registering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Register {krumpName}.krump
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Network: Story Testnet (Aeneid)
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};