"use client";

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input'; // Import the new component

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: crypto.randomUUID(), text: "Welcome to Chitkara University! Ask me about admissions, courses, placements, campus life, transport, clubs, or more.", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

  const placeholders = [
    "Ask about admissions...",
    "What courses are offered?",
    "Tell me about campus life.",
    "Where can I find information on placements?",
    "What are the transport options?",
    "Are there any student clubs?",
    "How do I apply for a hostel?",
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission
    if (input.trim()) {
      const newUserMessage: Message = { id: crypto.randomUUID(), text: input, sender: 'user' };
      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      setInput(''); // Clear input immediately

      // Simulate API call
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: updatedMessages, sessionId: 'user-session-id' }), // Send all messages for context
        });
        const data = await response.json();
        const botResponse: Message = { id: crypto.randomUUID(), text: data.response, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = { id: crypto.randomUUID(), text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 text-center text-xl font-bold">
        Chitkara University Assistant
      </header>
      <ScrollArea className="flex-1 p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[70%] p-3 rounded-lg",
                message.sender === 'user'
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="flex p-4 border-t border-border bg-card justify-center">
        <PlaceholdersAndVanishInput
          placeholders={placeholders}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
        />
      </div>
    </div>
  );
}