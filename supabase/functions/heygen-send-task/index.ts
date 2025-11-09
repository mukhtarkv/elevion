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
    console.log('Received send-task request:', body);
    const { sessionId, text, taskType = 'repeat' } = body;

    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY');

    if (!heygenApiKey) {
      throw new Error('HEYGEN_API_KEY not configured');
    }

    if (!sessionId || !text) {
      throw new Error('Session ID and text are required');
    }

    console.log('Sending task to HeyGen session:', sessionId);
    const response = await fetch('https://api.heygen.com/v1/streaming.task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': heygenApiKey
      },
      body: JSON.stringify({
        session_id: sessionId,
        text: text,
        task_type: taskType,
        task_mode: 'sync'
      })
    });

    console.log('HeyGen task response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen task error response:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        throw new Error(`HeyGen API error: ${response.status} ${errorText}`);
      }
      throw new Error(errorData.message || 'Failed to send task');
    }

    const data = await response.json();
    console.log('HeyGen task response:', JSON.stringify(data));

    return new Response(
      JSON.stringify({
        success: true,
        reply: data.data?.reply || data.reply,
        taskId: data.data?.task_id || data.task_id
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in heygen-send-task:', error);
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