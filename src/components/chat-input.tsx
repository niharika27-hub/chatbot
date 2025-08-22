"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isLoading }: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="flex justify-center mt-10 w-full px-4">
      <div className="relative flex items-center w-full max-w-[700px] h-[52px] rounded-[30px] bg-[#1e1e1e] border border-[#333333]">
        <Input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Type your message..."
          className={cn(
            "flex-1 h-full rounded-[30px] bg-transparent border-none text-white placeholder:text-[#b3b3b3] focus-visible:ring-0 focus-visible:ring-offset-0",
            "pl-5 pr-16 text-base" // Adjust padding for icons
          )}
          disabled={isLoading}
        />
        <div className="absolute right-0 flex items-center pr-3 space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#b3b3b3] hover:bg-transparent hover:text-white"
            disabled={isLoading}
          >
            <Mic className="h-5 w-5" />
            <span className="sr-only">Voice Input</span>
          </Button>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#b3b3b3] hover:bg-transparent hover:text-white"
            disabled={!value.trim() || isLoading}
          >
            <Send className="h-5 w-5" />
            <span className="sr-only">Send Message</span>
          </Button>
        </div>
      </div>
    </form>
  );
};