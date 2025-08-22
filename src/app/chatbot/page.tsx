"use client";

import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader } from '@/components/ui/loader';
import { ChatInput } from '@/components/chat-input'; // Import the new ChatInput component

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]); // Start with an empty array for messages
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex flex-col h-screen bg-[#121212] text-white font-sans">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 mt-[20vh]">
          <p className="text-2xl font-medium text-center text-white">
            What's on your mind today?
          </p>
        </div>
      ) : (
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
                    ? "bg-blue-600 text-white" // Using a blue for user messages for contrast
                    : "bg-[#1e1e1e] text-white"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mt-4">
              <div className="bg-[#1e1e1e] text-white p-3 rounded-lg max-w-[70%]">
                <Loader className="h-6 w-6" />
              </div>
            </div>
          )}
        </ScrollArea>
      )}
      <div className="flex p-4 border-t border-[#333333] bg-[#121212] justify-center">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}