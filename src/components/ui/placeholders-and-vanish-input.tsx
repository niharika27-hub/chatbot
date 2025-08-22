"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { Button } from "./button"; // Assuming Button is a shadcn/ui component
import { Input } from "./input"; // Assuming Input is a shadcn/ui component

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  className,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
    setValue(""); // Clear input after submission
  };

  return (
    <form
      className={cn(
        "relative bg-white/10 dark:bg-black/10 text-white border border-white/20 max-w-md w-full rounded-full flex items-center space-x-2 pr-2", // Updated styling
        className
      )}
      onSubmit={handleSubmit}
    >
      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholders[currentPlaceholder]}
        className="flex-1 rounded-full border-none bg-transparent px-4 py-2 text-white placeholder:text-white/70 focus:outline-none focus:ring-0" // Updated styling
      />
      <Button
        type="submit"
        className="rounded-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-200"
      >
        <motion.span
          initial={{ y: 0 }}
          animate={{ y: -10 }}
          transition={{
            repeat: Infinity,
            duration: 1,
            repeatType: "reverse",
          }}
          className="flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-4 w-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
            />
          </svg>
        </motion.span>
      </Button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <motion.p
          initial={{ y: 5, opacity: 0 }}
          key={placeholders[currentPlaceholder]}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-sm text-white/70 absolute left-4 z-10"
        >
          {placeholders[currentPlaceholder]}
        </motion.p>
      </div>
    </form>
  );
}