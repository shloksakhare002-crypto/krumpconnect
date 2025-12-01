import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CreateFamDialog } from "@/components/fams/CreateFamDialog";
import { FamCard } from "@/components/fams/FamCard";

interface Fam {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  bio: string | null;
  logo_url: string | null;
  recruitment_status: string;
  audition_link: string | null;
  big_homie: {
    display_name: string;
    krump_name: string | null;
  } | null;
  member_count: number;
}

const Fams = () => {
  const [fams, setFams] = useState<Fam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFams();
  }, []);

  const fetchFams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fams")
        .select(`
          id,
          name,
          slug,
          city,
          bio,
          logo_url,
          recruitment_status,
          audition_link,
          big_homie:profiles!fams_big_homie_id_fkey(
            display_name,
            krump_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get member counts for each fam
      const famsWithCounts = await Promise.all(
        (data || []).map(async (fam) => {
          const { count } = await supabase
            .from("fam_members")
            .select("*", { count: "exact", head: true })
            .eq("fam_id", fam.id);

          return {
            ...fam,
            member_count: count || 0,
          };
        })
      );

      setFams(famsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error loading fams",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-16">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-accent bg-clip-text text-transparent">
                  Krump Fams
                </h1>
                <p className="text-muted-foreground">
                  Digital Headquarters - Discover families and their lineage
                </p>
              </div>
              <CreateFamDialog onFamCreated={fetchFams} />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Hit List Section */}
          <Card className="mb-8 border-secondary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-secondary" />
                The Hit List
              </CardTitle>
              <CardDescription>Active Fam-to-Fam challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active challenges yet</p>
                <p className="text-sm mt-2">Fams can challenge each other to battles here</p>
              </div>
            </CardContent>
          </Card>

          {/* Fams Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : fams.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No fams yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a Krump fam in your city!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fams.map((fam) => (
                <FamCard key={fam.id} fam={fam} />
              ))}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-card border-primary/20">
              <h3 className="font-bold mb-3 text-primary flex items-center gap-2">
                <Users className="h-5 w-5" />
                The Family Tree
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Each Fam page displays a visual lineage diagram showing:
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Big Homie (Admin) → First Gen → Second Gen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Clear mentor relationships</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span>Generational hierarchy</span>
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gradient-card border-secondary/20">
              <h3 className="font-bold mb-3 text-secondary flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Challenge Other Fams
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Post friendly challenges directly on Fam pages. Call out specific Fams for battles:
              </p>
              <div className="p-3 bg-background/50 rounded border border-border text-sm italic">
                "We want a 5v5 with [Other Fam] at IKF 2024"
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Fam culture is the backbone of Indian Krump. Give Fams formal pages to legitimize beyond WhatsApp groups.
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Fams;
