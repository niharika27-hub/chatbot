"use client";
import React from "react";
import { motion, Transition } from "framer-motion"; // Import Transition for explicit typing
import { cn } from "@/lib/utils";

const loadingContainerVariants = {
  start: {
    transition: {
      staggerChildren: 0.2,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const loadingCircleVariants = {
  start: {
    y: "0%",
  },
  end: {
    y: "100%",
  },
};

const loadingCircleTransition: Transition = {
  duration: 0.4,
  repeat: Infinity,
  repeatType: "reverse",
  ease: [0.42, 0, 0.58, 1], // Changed from "easeInOut" to cubic-bezier array to satisfy TypeScript
};

export const Loader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex justify-center items-center h-full", className)}>
      <motion.div
        className="flex space-x-1"
        variants={loadingContainerVariants}
        initial="start"
        animate="end"
      >
        <motion.span
          className="block w-3 h-3 rounded-full bg-primary"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        <motion.span
          className="block w-3 h-3 rounded-full bg-primary"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
        <motion.span
          className="block w-3 h-3 rounded-full bg-primary"
          variants={loadingCircleVariants}
          transition={loadingCircleTransition}
        />
      </motion.div>
    </div>
  );
};