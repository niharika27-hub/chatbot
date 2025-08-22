// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
// @deno-types="https://esm.sh/@supabase/supabase-js@2.45.0/dist/index.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for administrative tasks
    // @ts-ignore
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const tablesToPopulate = [
      { name: 'blocks', fields: ['name', 'description', 'departments', 'labs', 'features'] },
      { name: 'clubs', fields: ['name', 'type', 'activities', 'contact_email'] },
      { name: 'contacts', fields: ['name', 'department', 'phone', 'email', 'role'] },
      { name: 'courses', fields: ['name', 'degree', 'dept', 'fee', 'duration', 'eligibility'] },
      { name: 'events', fields: ['name', 'description', 'date'] },
      { name: 'faqs', fields: ['question', 'answer', 'tags'] },
      { name: 'hostels', fields: ['name', 'gender', 'beds', 'fee', 'amenities', 'description'] },
      { name: 'sports', fields: ['name', 'type', 'facilities', 'events', 'description'] },
      { name: 'transport', fields: ['route', 'stops', 'timings', 'notes'] },
    ];

    let totalDocumentsInserted = 0;

    for (const tableConfig of tablesToPopulate) {
      const { data: rows, error: fetchError } = await supabaseAdmin
        .from(tableConfig.name)
        .select('id, ' + tableConfig.fields.join(', '));

      if (fetchError) {
        console.error(`Error fetching data from ${tableConfig.name}:`, fetchError);
        continue;
      }

      if (rows && rows.length > 0) {
        for (const row of rows) {
          // Construct content string
          const contentParts: string[] = [];
          for (const field of tableConfig.fields) {
            const value = row[field];
            if (value) {
              if (Array.isArray(value)) {
                contentParts.push(`${field}: ${value.join(', ')}`);
              } else if (typeof value === 'object' && value !== null && 'toString' in value) {
                contentParts.push(`${field}: ${value.toString()}`);
              } else {
                contentParts.push(`${field}: ${value}`);
              }
            }
          }
          const content = contentParts.join('. ');

          if (!content) {
            console.warn(`Skipping empty content for ${tableConfig.name} ID: ${row.id}`);
            continue;
          }

          // Generate embedding
          // @ts-ignore
          const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
          const generateEmbeddingUrl = `${SUPABASE_URL}/functions/v1/generate-embedding`;

          const embeddingResponse = await fetch(generateEmbeddingUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // @ts-ignore
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`, // Use anon key for invoking other edge functions
            },
            body: JSON.stringify({ text: content }),
          });

          const embeddingData = await embeddingResponse.json();

          if (!embeddingResponse.ok || !embeddingData.embedding) {
            console.error(`Error generating embedding for ${tableConfig.name} ID ${row.id}:`, embeddingData);
            continue;
          }

          // Insert into documents table
          const { error: insertError } = await supabaseAdmin
            .from('documents')
            .insert({
              content: content,
              embedding: embeddingData.embedding,
              source_table: tableConfig.name,
              source_id: row.id,
            });

          if (insertError) {
            console.error(`Error inserting document for ${tableConfig.name} ID ${row.id}:`, insertError);
          } else {
            totalDocumentsInserted++;
          }
        }
      }
    }

    return new Response(JSON.stringify({ message: `Successfully populated documents table. Total documents inserted: ${totalDocumentsInserted}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: unknown) {
    console.error('Edge Function error:', error);
    let errorMessage = "An unknown error occurred during population.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});