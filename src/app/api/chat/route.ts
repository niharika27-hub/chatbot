import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';
import { promises as fs } from 'fs';
import path from 'path';

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

  // --- Step 1: Read all .txt files from the local directory ---
  let contextData: { filename: string; content: string }[] = [];
  const txtFilesDirectory = path.join(process.cwd(), 'txt_files');

  try {
    const files = await fs.readdir(txtFilesDirectory);
    const txtFiles = files.filter(file => file.endsWith('.txt'));

    for (const filename of txtFiles) {
      const filePath = path.join(txtFilesDirectory, filename);
      const textContent = await fs.readFile(filePath, 'utf-8');
      contextData.push({ filename, content: textContent });
    }
  } catch (error) {
    console.error('Error reading local .txt files:', error);
    // If there's an error reading local files, we'll proceed without this context
    // to ensure the chat doesn't completely fail.
  }

  // Log the context data to see what's being sent to Gemini
  console.log('Context Data (from local files) sent to Gemini:', contextData.map(c => c.filename));

  // --- Step 2: Invoke the Gemini Edge Function with the retrieved context ---
  try {
    const { data, error } = await supabase.functions.invoke('gemini-chat', {
      body: { messages, contextData }, // Pass the messages and the new contextData
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