"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000); // Change placeholder every 3 seconds
    return () => clearInterval(interval);
  }, [placeholders.length]);

  const variants = {
    initial: {
      y: 0,
      opacity: 0,
    },
    animate: {
      y: -10,
      opacity: 1,
    },
    vanish: {
      y: -20,
      opacity: 0,
    },
  };

  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full flex space-x-2 items-center shadow-lg border border-neutral-200 dark:border-neutral-700"
    >
      <input
        type="text"
        onChange={onChange}
        placeholder=" " // Keep placeholder empty to let the animated one show
        className="flex-1 h-full outline-none border-0 bg-transparent text-zinc-900 dark:text-zinc-100 pl-4 pr-10 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:ring-0"
      />
      <button
        type="submit"
        className="relative h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white mr-3 transition-all duration-300 hover:scale-105"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"
          />
        </svg>
      </button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.p
            initial="initial"
            animate="animate"
            exit="vanish"
            variants={variants}
            key={placeholders[currentPlaceholder]}
            className="text-sm text-white dark:text-white absolute left-4 top-1/2 -translate-y-1/2"
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            {placeholders[currentPlaceholder]}
          </motion.p>
        </AnimatePresence>
      </div>
    </form>
  );
}