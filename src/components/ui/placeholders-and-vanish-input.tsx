"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000); // Cycle every 3 seconds
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition-all duration-500"
    >
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-full h-full pl-4 pr-12 rounded-full bg-transparent text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-blue-500 flex items-center justify-center text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </button>

      <AnimatePresence mode="wait">
        {inputValue === "" && (
          <motion.p
            key={placeholders[currentPlaceholder]}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white pointer-events-none"
          >
            {placeholders[currentPlaceholder]}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}