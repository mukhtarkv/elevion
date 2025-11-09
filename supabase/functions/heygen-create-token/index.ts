import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);
    const avatarId = body.avatarId;

    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY');
    console.log('HEYGEN_API_KEY exists:', !!heygenApiKey);

    if (!heygenApiKey) {
      throw new Error('HEYGEN_API_KEY not configured');
    }

    if (!avatarId) {
      throw new Error('Avatar ID is required');
    }

    console.log('Calling HeyGen API with avatar:', avatarId);
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygenApiKey
      },
      body: JSON.stringify({
        avatar_id: avatarId
      })
    });

    console.log('HeyGen response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`HeyGen API error: ${response.status} ${errorText}`);
      }
      throw new Error(errorData.message || 'Failed to create session token');
    }

    const data = await response.json();
    console.log('HeyGen response data:', JSON.stringify(data));
    console.log('Full data structure:', data);

    let sessionToken = null;

    if (data.data) {
      sessionToken = data.data.session_token || data.data.token || data.data.access_token;
    }

    if (!sessionToken) {
      sessionToken = data.session_token || data.token || data.access_token;
    }

    if (!sessionToken) {
      console.error('No session token found. Full response:', JSON.stringify(data, null, 2));
      console.error('Available keys:', Object.keys(data));
      if (data.data) {
        console.error('Data keys:', Object.keys(data.data));
      }
      throw new Error(`No session token in response. Response keys: ${Object.keys(data).join(', ')}`);
    }

    console.log('Successfully created session token');
    return new Response(
      JSON.stringify({ sessionToken }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in heygen-create-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});