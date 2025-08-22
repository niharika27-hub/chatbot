// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple text chunking function
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + chunkSize, text.length);
    // Try to find a natural break (sentence end, paragraph end)
    let chunk = text.substring(i, end);
    const lastPeriod = chunk.lastIndexOf('.');
    const lastNewline = chunk.lastIndexOf('\n\n');

    if (end < text.length && (lastPeriod > i || lastNewline > i)) {
      if (lastNewline > lastPeriod) {
        end = i + lastNewline + 2; // Include the double newline
      } else {
        end = i + lastPeriod + 1; // Include the period
      }
      chunk = text.substring(i, end);
    }
    chunks.push(chunk.trim());
    i = end - overlap;
    if (i < 0) i = 0; // Ensure i doesn't go negative
  }
  return chunks.filter(chunk => chunk.length > 0);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, filename, storage_path }: { text: string; filename: string; storage_path: string } = await req.json();

    if (!text || !filename || !storage_path) {
      return new Response(JSON.stringify({ error: "Missing text, filename, or storage_path." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Initialize Supabase client with service role key for administrative tasks
    // @ts-ignore
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    // 1. Insert PDF metadata into pdf_documents table
    const { data: pdfDoc, error: pdfInsertError } = await supabaseAdmin
      .from('pdf_documents')
      .insert({ filename, storage_path })
      .select('id')
      .single();

    if (pdfInsertError || !pdfDoc) {
      console.error('Error inserting PDF document metadata:', pdfInsertError);
      return new Response(JSON.stringify({ error: "Failed to record PDF document metadata.", details: pdfInsertError?.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const pdfId = pdfDoc.id;
    const chunks = chunkText(text);
    let documentsInserted = 0;

    // @ts-ignore
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const generateEmbeddingUrl = `${SUPABASE_URL}/functions/v1/generate-embedding`;

    for (const chunk of chunks) {
      // Generate embedding for each chunk
      const embeddingResponse = await fetch(generateEmbeddingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // @ts-ignore
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`, // Use anon key for invoking other edge functions
        },
        body: JSON.stringify({ text: chunk }),
      });

      const embeddingData = await embeddingResponse.json();

      if (!embeddingResponse.ok || !embeddingData.embedding) {
        console.error(`Error generating embedding for chunk from ${filename}:`, embeddingData);
        continue; // Skip this chunk if embedding fails
      }

      // Insert into documents table
      const { error: insertError } = await supabaseAdmin
        .from('documents')
        .insert({
          content: chunk,
          embedding: embeddingData.embedding,
          source_table: 'pdf_documents', // Link to our new table
          source_id: pdfId, // Link to the specific PDF document
        });

      if (insertError) {
        console.error(`Error inserting document chunk for ${filename}:`, insertError);
      } else {
        documentsInserted++;
      }
    }

    return new Response(JSON.stringify({ message: `Successfully processed ${filename}. Total chunks inserted: ${documentsInserted}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error:', error);
    let errorMessage = "An unknown error occurred during document processing.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});