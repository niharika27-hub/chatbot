"use client";

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { Loader } from '@/components/ui/loader';
import { WavyBackground } from '@/components/ui/wavy-background';

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
  const [isLoading, setIsLoading] = useState(false);

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
    e.preventDefault();
    if (input.trim()) {
      const newUserMessage: Message = { id: crypto.randomUUID(), text: input, sender: 'user' };
      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);
      setInput('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ messages: updatedMessages, sessionId: 'user-session-id' }),
        });
        const data = await response.json();
        const botResponse: Message = { id: crypto.randomUUID(), text: data.response, sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botResponse]);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage: Message = { id: crypto.randomUUID(), text: "Sorry, I'm having trouble connecting right now. Please try again later.", sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <WavyBackground className="max-w-full mx-auto h-screen flex flex-col items-center justify-center">
      <div className="relative z-10 flex flex-col h-[90vh] w-full max-w-3xl bg-black/20 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 text-center text-2xl font-bold text-white border-b border-white/20">
          Chitkara University Assistant
        </div>
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
                    ? "bg-blue-600/70 text-white" // Semi-transparent blue for user
                    : "bg-gray-700/70 text-white" // Semi-transparent dark gray for bot
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mt-4">
              <div className="bg-gray-700/70 text-white p-3 rounded-lg max-w-[70%]">
                <Loader className="h-6 w-6" />
              </div>
            </div>
          )}
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex p-4 border-t border-white/20 justify-center">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleInputChange}
            onSubmit={handleSendMessage}
          />
        </form>
      </div>
    </WavyBackground>
  );
}