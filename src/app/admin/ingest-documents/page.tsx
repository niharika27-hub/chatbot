"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload } from 'lucide-react';

export default function IngestDocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/plain') {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a .txt file.");
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a .txt file to upload.");
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const textContent = e.target?.result as string;
      const filename = selectedFile.name;
      const storagePath = `documents/${filename}`; // A logical path for metadata, actual file not stored here

      try {
        // Call the process-document-text Edge Function
        const { data, error } = await supabase.functions.invoke('process-document-text', {
          body: {
            text: textContent,
            filename: filename,
            storage_path: storagePath,
          },
        });

        if (error) {
          console.error('Error invoking process-document-text Edge Function:', error);
          toast.error(`Failed to process document: ${error.message}`);
        } else {
          toast.success(`Document "${filename}" processed successfully!`);
          console.log('Processing result:', data);
          setSelectedFile(null); // Clear the selected file after successful upload
        }
      } catch (error) {
        console.error('Unexpected error during document processing:', error);
        toast.error("An unexpected error occurred during document processing.");
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file.");
      setIsProcessing(false);
    };

    reader.readAsText(selectedFile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6 p-6 border rounded-lg shadow-lg bg-card">
        <h1 className="text-2xl font-bold text-center text-card-foreground">Ingest Text Documents</h1>
        <p className="text-center text-muted-foreground">
          Upload your `.txt` files here to add them to the chatbot's knowledge base.
          The content will be chunked, embedded, and stored for efficient retrieval.
        </p>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="document-upload">Upload .txt File</Label>
          <Input
            id="document-upload"
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="cursor-pointer"
            disabled={isProcessing}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          className="w-full"
          disabled={!selectedFile || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Ingest Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}