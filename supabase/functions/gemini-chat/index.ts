// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, contextData }: { messages: { text: string; sender: 'user' | 'bot' }[]; contextData: Record<string, any>[] } = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "No messages provided." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const latestUserMessage = messages[messages.length - 1].text;

    const systemPrompt = `Act as an expert virtual assistant for Chitkara University, Punjab. 
    Use ONLY the structured information provided (displayed below as JSON blobs) to answer any question about the campus, admissions, academics, campus life, placement, or student services.
    If you do not know the answer, politely say so and direct the user to appropriate university contacts.
    
    Additional Guidelines:
    - Do not speculate: if information is unknown, say so.
    - For contact queries, provide up-to-date emails/phone numbers/office hours.
    - For “how to”/procedural queries, provide stepwise instructions from the data.
    - For requests about locations, blocks, or buildings, reference the campus map data.
    - For sensitive issues (grievances/delays), provide official escalation contacts.
    - Use friendly, concise language.
    - Partition your answer with appropriate paragraph breaks and, if needed, simple markdown tables.
    - Suggest next steps, links, or contacts if available.
    
    If no answer is found: “Sorry, I don’t have that information. Please contact [provided department contact].”`;

    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + "\n\nContext Data (JSON): " + JSON.stringify(contextData, null, 2) }],
      },
      ...conversationHistory,
    ];

    // @ts-ignore
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Gemini API Key not set in environment variables." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: geminiMessages,
        }),
      }
    );

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiData);
      return new Response(JSON.stringify({ error: "Failed to get response from Gemini API.", details: geminiData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    const botResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ response: botResponseText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: unknown) {
    console.error('Edge Function error:', error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});