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

  const latestUserMessage = messages[messages.length - 1].text.toLowerCase();

  // --- Step 1: Dynamically fetch relevant context from Supabase based on the latest user message ---
  let contextData: Record<string, any>[] = [];

  const keywordsMap = {
    'faq': ['faqs'],
    'question': ['faqs'],
    'answer': ['faqs'],
    'hostel': ['hostels'],
    'accommodation': ['hostels'],
    'room': ['hostels'],
    'course': ['courses'],
    'degree': ['courses'],
    'program': ['courses'],
    'admission': ['courses', 'contacts', 'faqs', 'calendar'],
    'contact': ['contacts'],
    'phone': ['contacts'],
    'email': ['contacts'],
    'department': ['contacts', 'blocks'],
    'block': ['blocks'],
    'building': ['blocks'],
    'lab': ['blocks'],
    'library': ['blocks', 'faqs'],
    'sport': ['sports'],
    'game': ['sports'],
    'facility': ['sports', 'hostels', 'blocks'],
    'transport': ['transport'],
    'bus': ['transport'],
    'route': ['transport'],
    'club': ['clubs'],
    'society': ['clubs'],
    'event': ['events', 'calendar'],
    'date': ['events', 'calendar'],
    'schedule': ['calendar'],
    'placement': ['faqs'], // Placements are often covered in FAQs
    'fee': ['courses', 'hostels', 'faqs'],
  };

  const tablesToQuery = new Set<string>();
  for (const keyword in keywordsMap) {
    if (latestUserMessage.includes(keyword)) {
      keywordsMap[keyword as keyof typeof keywordsMap].forEach(table => tablesToQuery.add(table));
    }
  }

  // If no specific keywords, default to FAQs or a general search
  if (tablesToQuery.size === 0) {
    tablesToQuery.add('faqs');
    tablesToQuery.add('courses'); // Add courses as a common default
  }

  try {
    for (const table of Array.from(tablesToQuery)) {
      let query;
      switch (table) {
        case 'faqs':
          query = supabase.from('faqs').select('question, answer, tags').ilike('question', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'courses':
          query = supabase.from('courses').select('name, degree, dept, fee, duration, eligibility').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'contacts':
          query = supabase.from('contacts').select('name, department, phone, email, role').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'blocks':
          query = supabase.from('blocks').select('name, description, departments, labs, features').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'hostels':
          query = supabase.from('hostels').select('name, gender, beds, fee, amenities, description').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'sports':
          query = supabase.from('sports').select('name, type, facilities, events, description').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'transport':
          query = supabase.from('transport').select('route, stops, timings, notes').ilike('route', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'clubs':
          query = supabase.from('clubs').select('name, type, activities, contact_email').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'events':
          query = supabase.from('events').select('name, date, description, club_id').ilike('name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        case 'calendar':
          query = supabase.from('calendar').select('event_name, start_date, end_date, type, description').ilike('event_name', `%${latestUserMessage.split(' ')[0]}%`).limit(3);
          break;
        default:
          query = null;
      }

      if (query) {
        const { data, error } = await query;
        if (error) {
          console.error(`Supabase ${table} error:`, error);
        }
        if (data && data.length > 0) {
          contextData.push({ [table]: data });
        }
      }
    }
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