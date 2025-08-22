"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const LoaderOne = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex justify-center items-center h-full", className)}>
      <motion.div
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          duration: 0.2,
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        whileHover={{
          scale: 1.2,
          rotate: 10,
        }}
        whileTap={{
          scale: 0.9,
          rotate: -10,
        }}
        className="h-10 w-10 rounded-full border-4 border-t-4 border-gray-200 animate-spin"
        style={{
          borderTopColor: "var(--primary)", // Using a CSS variable for primary color
        }}
      ></motion.div>
    </div>
  );
};