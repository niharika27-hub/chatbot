"use server";

import { promises as fs } from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/integrations/supabase/server';
import { supabase } from '@/integrations/supabase/client'; // For invoking edge functions
import { toast } from 'sonner'; // Note: toast from sonner is a client-side component, this import is for type inference if needed, but actual toast calls should be on client.

// Simple text chunking function (duplicated from process-document-text for server action isolation)
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = Math.min(i + chunkSize, text.length);
    let chunk = text.substring(i, end);
    const lastPeriod = chunk.lastIndexOf('.');
    const lastNewline = chunk.lastIndexOf('\n\n');

    if (end < text.length && (lastPeriod > i || lastNewline > i)) {
      if (lastNewline > lastPeriod) {
        end = i + lastNewline + 2;
      } else {
        end = i + lastPeriod + 1;
      }
      chunk = text.substring(i, end);
    }
    chunks.push(chunk.trim());
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks.filter(chunk => chunk.length > 0);
}

export async function ingestLocalTxtFiles() {
  const txtFilesDirectory = path.join(process.cwd(), 'txt_files');
  let totalDocumentsInserted = 0;
  let errorsEncountered = 0;

  try {
    const files = await fs.readdir(txtFilesDirectory);
    const txtFiles = files.filter(file => file.endsWith('.txt'));

    if (txtFiles.length === 0) {
      return { success: true, message: "No .txt files found in the 'txt_files' directory." };
    }

    for (const filename of txtFiles) {
      const filePath = path.join(txtFilesDirectory, filename);
      const textContent = await fs.readFile(filePath, 'utf-8');
      const storagePath = `local_txt_files/${filename}`; // A logical path for metadata

      // 1. Insert PDF metadata into pdf_documents table (reusing for generic documents)
      // This step is optional if you don't need a separate record for the source file itself,
      // but it helps link chunks back to their original document.
      const { data: docRecord, error: docInsertError } = await supabaseAdmin
        .from('pdf_documents') // Reusing pdf_documents table for generic document metadata
        .insert({ filename, storage_path: storagePath }) // Corrected variable name here
        .select('id')
        .single();

      if (docInsertError || !docRecord) {
        console.error(`Error inserting document metadata for ${filename}:`, docInsertError);
        errorsEncountered++;
        continue;
      }

      const documentId = docRecord.id;
      const chunks = chunkText(textContent);

      for (const chunk of chunks) {
        // Generate embedding for each chunk using the Edge Function
        const { data: embeddingData, error: embeddingError } = await supabase.functions.invoke('generate-embedding', {
          body: { text: chunk },
        });

        if (embeddingError || !embeddingData?.embedding) {
          console.error(`Error generating embedding for chunk from ${filename}:`, embeddingError || embeddingData);
          errorsEncountered++;
          continue;
        }

        // Insert into documents table
        const { error: insertError } = await supabaseAdmin
          .from('documents')
          .insert({
            content: chunk,
            embedding: embeddingData.embedding,
            source_table: 'local_txt_files', // Custom source table identifier
            source_id: documentId, // Link to the specific document record
          });

        if (insertError) {
          console.error(`Error inserting document chunk for ${filename}:`, insertError);
          errorsEncountered++;
        } else {
          totalDocumentsInserted++;
        }
      }
    }

    if (errorsEncountered > 0) {
      return { success: false, message: `Ingestion completed with ${errorsEncountered} errors. Total chunks inserted: ${totalDocumentsInserted}. Check server logs for details.` };
    } else {
      return { success: true, message: `Successfully ingested ${totalDocumentsInserted} document chunks from local .txt files.` };
    }

  } catch (error: any) {
    console.error('Error during local .txt file ingestion:', error);
    return { success: false, message: `An unexpected error occurred: ${error.message}` };
  }
}