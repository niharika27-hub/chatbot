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
    // Placeholder for actual Supabase context retrieval logic
    // In a real implementation, you would query your tables (faqs, courses, etc.)
    // based on keywords or intent derived from `latestUserMessage`.
    // For now, we'll simulate some context.

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

  // --- Step 2: Construct a prompt for Gemini 2.5 Flash ---
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

  const conversationHistory = messages.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');

  const fullPrompt = `${systemPrompt}\n\nContext Data (JSON): ${JSON.stringify(contextData, null, 2)}\n\nConversation History:\n${conversationHistory}\n\nUser Question: ${latestUserMessage}\n\nYour response:`;

  // --- Step 3: Call the Gemini API (Placeholder) ---
  // In a real application, you would make an actual API call to Gemini 2.5 Flash here.
  // For now, we'll simulate a response based on the prompt and context.
  let botResponseText = `You asked: "${latestUserMessage}". I've received the conversation history and some context from Supabase.`;

  if (contextData.length > 0) {
    botResponseText += ` I found some relevant information: ${JSON.stringify(contextData[0])}.`;
  }
  botResponseText += ` I'm ready to integrate with Gemini 2.5 Flash to provide more detailed answers!`;


  // --- Step 4: Process Gemini's response and potentially store interaction ---
  // (Skipping interaction storage for now as per "without saving chats" requirement)

  return NextResponse.json({ response: botResponseText, sessionId });
}