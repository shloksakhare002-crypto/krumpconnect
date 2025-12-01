import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PINATA_JWT = Deno.env.get('PINATA_JWT');
    if (!PINATA_JWT) {
      throw new Error('PINATA_JWT not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size}`);

    // Upload to Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Optional metadata
    const metadata = JSON.stringify({
      name: file.name,
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
    console.log('Upload successful:', result.IpfsHash);

    return new Response(
      JSON.stringify({
        ipfsHash: result.IpfsHash,
        ipfsUrl: `ipfs://${result.IpfsHash}`,
        gatewayUrl: `https://fuchsia-far-impala-831.mypinata.cloud/ipfs/${result.IpfsHash}`,
        pinSize: result.PinSize,
        timestamp: result.Timestamp,
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
