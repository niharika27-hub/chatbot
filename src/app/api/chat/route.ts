import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export async function POST(req: Request) {
  const { messages, sessionId }: { messages: Message[]; sessionId: string } = await req.json();

  if (!messages || messages.length === 0) {
    return NextResponse.json({ response: "No message provided.", sessionId }, { status: 400 });
  }

  const latestUserMessage = messages[messages.length - 1].text; // Keep original case for embedding

  // --- Step 1: Generate embedding for the user's query ---
  let queryEmbedding: number[] | null = null;
  try {
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: { text: latestUserMessage },
    });

    if (error) {
      console.error('Error generating query embedding:', error);
      return NextResponse.json({ response: "Sorry, I'm having trouble understanding your query. Please try again.", sessionId }, { status: 500 });
    }
    queryEmbedding = data.embedding;
  } catch (error) {
    console.error('Unexpected error during embedding generation:', error);
    return NextResponse.json({ response: "An unexpected error occurred while processing your query. Please try again.", sessionId }, { status: 500 });
  }

  // --- Step 2: Perform vector similarity search in the 'documents' table ---
  let contextData: Record<string, any>[] = [];
  if (queryEmbedding) {
    try {
      const { data: documents, error: searchError } = await supabase
        .from('documents')
        .select('content, source_table, source_id')
        .order(`embedding <-> '${JSON.stringify(queryEmbedding)}'::vector`, { ascending: true })
        .limit(5); // Retrieve top 5 most similar documents

      if (searchError) {
        console.error('Supabase vector search error:', searchError);
      }

      if (documents && documents.length > 0) {
        // Format the retrieved documents into contextData
        contextData = documents.map(doc => ({
          content: doc.content,
          source_table: doc.source_table,
          source_id: doc.source_id,
        }));
      }
    } catch (error) {
      console.error('Error performing vector search:', error);
    }
  }

  // Log the context data to see what's being sent to Gemini
  console.log('Context Data sent to Gemini:', contextData);

  // --- Step 3: Invoke the Gemini Edge Function with the retrieved context ---
  try {
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { messages, contextData },
    });

    if (error) {
      console.error('Error invoking Gemini Edge Function:', error);
      return NextResponse.json({ response: "Sorry, I'm having trouble processing your request with the AI. Please try again later.", sessionId }, { status: 500 });
    }

    return NextResponse.json({ response: data.response, sessionId });

  } catch (error) {
    console.error('Unexpected error during Edge Function invocation:', error);
    return NextResponse.json({ response: "An unexpected error occurred. Please try again.", sessionId }, { status: 500 });
  }
}