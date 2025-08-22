import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

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

  const latestUserMessage = messages[messages.length - 1].text;

  // --- Step 1: Fetch relevant context from Supabase based on the latest user message ---
  let contextData: Record<string, any>[] = [];
  try {
    // Example: Fetching FAQs
    const { data: faqs, error: faqsError } = await supabase
      .from('faqs')
      .select('question, answer')
      .ilike('question', `%${latestUserMessage.split(' ')[0]}%`) // Simple keyword match for demo
      .limit(1); // Limit to one relevant FAQ for brevity

    if (faqsError) console.error('Supabase FAQs error:', faqsError);
    if (faqs && faqs.length > 0) {
      contextData.push({ faqs: faqs });
    }

    // Add more context retrieval logic for other tables (courses, contacts, etc.) here
    // For example:
    // const { data: courses, error: coursesError } = await supabase.from('courses').select('name, description').ilike('name', `%${latestUserMessage}%`).limit(1);
    // if (courses && courses.length > 0) contextData.push({ courses: courses });

  } catch (error) {
    console.error('Error fetching Supabase context:', error);
  }

  // --- Step 2: Invoke the Gemini Edge Function ---
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