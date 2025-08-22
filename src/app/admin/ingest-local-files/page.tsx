"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, FolderUp } from 'lucide-react';
import { ingestLocalTxtFiles } from '../actions'; // Import the server action

export default function IngestLocalFilesPage() {
  const [isIngesting, setIsIngesting] = useState(false);

  const handleIngest = async () => {
    setIsIngesting(true);
    toast.info("Starting ingestion of local .txt files...");
    try {
      const result = await ingestLocalTxtFiles();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Client-side error calling ingestLocalTxtFiles:', error);
      toast.error("An unexpected error occurred during ingestion.");
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6 p-6 border rounded-lg shadow-lg bg-card">
        <h1 className="text-2xl font-bold text-center text-card-foreground">Ingest Local Text Files</h1>
        <p className="text-center text-muted-foreground">
          This will read all `.txt` files from the `txt_files` directory in your project root,
          chunk their content, generate embeddings, and store them in the Supabase `documents` table.
          This is a one-time process to build your chatbot's knowledge base from local files.
        </p>

        <Button
          onClick={handleIngest}
          className="w-full"
          disabled={isIngesting}
        >
          {isIngesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ingesting Files...
            </>
          ) : (
            <>
              <FolderUp className="mr-2 h-4 w-4" />
              Start Ingestion
            </>
          )}
        </Button>
        <p className="text-sm text-center text-muted-foreground mt-4">
          Make sure your `txt_files` directory exists at the root of your project and contains the `.txt` files you want to ingest.
          Also, ensure `SUPABASE_SERVICE_ROLE_KEY` is set in your environment variables for server-side operations.
        </p>
      </div>
    </div>
  );
}