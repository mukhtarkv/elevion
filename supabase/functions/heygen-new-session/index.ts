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

    console.log('Calling HeyGen streaming.new API with avatar:', avatarId);
    const response = await fetch('https://api.heygen.com/v1/streaming.new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygenApiKey
      },
      body: JSON.stringify({
        quality: 'medium',
        avatar_id: avatarId,
        voice: {
          voice_id: '1bd001e7e50f421d891986aad5158bc8'
        }
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
      throw new Error(errorData.message || 'Failed to create session');
    }

    const data = await response.json();
    console.log('HeyGen response data:', JSON.stringify(data));

    if (!data.data) {
      console.error('No data in response:', data);
      throw new Error('Invalid response from HeyGen API');
    }

    const { session_id, url, access_token } = data.data;

    if (!session_id || !url || !access_token) {
      console.error('Missing required fields in response:', data.data);
      throw new Error('Incomplete session data from HeyGen');
    }

    console.log('Successfully created session:', session_id);
    return new Response(
      JSON.stringify({
        sessionId: session_id,
        livekitUrl: url,
        roomToken: access_token
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in heygen-new-session:', error);
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