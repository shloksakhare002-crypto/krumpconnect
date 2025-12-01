import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user is authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { proof, merkle_root, nullifier_hash, verification_level } = await req.json();

    if (!proof || !merkle_root || !nullifier_hash) {
      throw new Error("Missing required World ID verification data");
    }

    // Check if nullifier_hash already used (prevent replay attacks)
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("world_id_nullifier_hash", nullifier_hash)
      .single();

    if (existingProfile) {
      throw new Error("World ID verification already used");
    }

    // Verify proof with World ID API
    const verifyResponse = await fetch(
      `https://developer.worldcoin.org/api/v2/verify/${Deno.env.get("WORLD_ID_APP_ID") || "app_d5a9549c3c37dee70c37ed4ba61e0dc8"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nullifier_hash,
          merkle_root,
          proof,
          verification_level,
          action: "proof-of-krump",
        }),
      }
    );

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json();
      throw new Error(`World ID verification failed: ${errorData.detail || "Unknown error"}`);
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      throw new Error("World ID verification rejected by World ID");
    }

    // Update user profile with verification
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        world_id_verified: true,
        world_id_nullifier_hash: nullifier_hash,
      })
      .eq("user_id", user.id);

    if (updateError) {
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        nullifier_hash,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("World ID verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
