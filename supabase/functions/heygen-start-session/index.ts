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
    console.log('Received body:', body);
    const sessionToken = body.sessionToken;

    if (!sessionToken) {
      console.error('No session token in body:', body);
      throw new Error('Session token is required');
    }

    console.log('Starting HeyGen session with token');
    const response = await fetch('https://api.heygen.com/v1/streaming.start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_token: sessionToken,
        sdp: { type: 'offer' }
      })
    });

    console.log('HeyGen start response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen start error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`HeyGen API error: ${response.status} ${errorText}`);
      }
      throw new Error(errorData.message || errorData.error || 'Failed to start session');
    }

    const data = await response.json();
    console.log('HeyGen start session response:', JSON.stringify(data));

    return new Response(
      JSON.stringify({
        livekitUrl: data.data?.url || data.url,
        roomToken: data.data?.access_token || data.access_token,
        sessionId: data.data?.session_id || data.session_id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in heygen-start-session:', error);
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