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

    const systemPrompt = `Act as an expert virtual assistant for Chitkara University, Punjab.
    Your primary goal is to provide accurate and helpful information based *only* on the structured data provided in the 'Context Data' section below.
    The 'Context Data' is retrieved using a semantic search based on the user's query, and it might contain information from various university resources like FAQs, courses, contacts, blocks, hostels, sports, transport, clubs, events, and calendar.

    If the answer is not found within the provided context, politely state that you don't have that specific information and suggest contacting the relevant university department (if a contact is available in the context).

    Additional Guidelines:
    - **Do not speculate or invent information.** If the answer is not in the context, say so.
    - **For contact queries**, provide the name, department, phone, and email if available in the context.
    - **For "how to" or procedural queries**, provide stepwise instructions from the data.
    - **For requests about locations, blocks, or buildings**, reference the campus map data (from 'blocks' table).
    - **For sensitive issues (grievances/delays)**, provide official escalation contacts if available.
    - **Use friendly, concise language.**
    - **Structure your answer clearly** using paragraph breaks, bullet points, or simple markdown tables if presenting multiple pieces of information.
    - **Suggest next steps, links, or contacts** if available and relevant to the answer.

    If no answer is found in the provided context for a specific query: "Sorry, I don't have that information. Please contact the relevant university department for more details."`;

    const conversationHistory = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Append context data to the system prompt for Gemini
    const contextString = contextData.length > 0
      ? "\n\nContext Data (JSON):\n" + JSON.stringify(contextData, null, 2)
      : "\n\nNo specific context data found for this query.";

    const geminiMessages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt + contextString }],
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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