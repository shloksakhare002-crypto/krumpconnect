import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed MIME types for uploads
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/quicktime', 'video/webm'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Verify user is authenticated
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${file.size} bytes. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}, user: ${user.id}`);

    // Upload to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      }
    });
    pinataFormData.append('pinataMetadata', metadata);

    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata error:', errorText);
      throw new Error(`Pinata upload failed: ${pinataResponse.statusText}`);
    }

    const result = await pinataResponse.json();
    console.log('Upload successful:', result.IpfsHash, 'by user:', user.id);

    return new Response(
      JSON.stringify({
        ipfsHash: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `https://fuchsia-far-impala-831.mypinata.cloud/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
        uploadedBy: user.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading to Pinata:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
