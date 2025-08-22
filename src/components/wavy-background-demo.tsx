"use client";
import React from "react";
import Link from "next/link";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Button } from "@/components/ui/button";

export default function WavyBackgroundDemo() {
  return (
    <WavyBackground className="max-w-4xl mx-auto pb-20 md:pb-40"> {/* Adjusted padding for mobile */}
      <div className="flex flex-col items-center justify-center h-full text-center px-4"> {/* Added horizontal padding for content */}
        <p className="text-2xl md:text-4xl lg:text-7xl text-white font-bold inter-var mb-4">
          Your Chitkara University Assistant
        </p>
        <p className="text-base md:text-lg mt-4 text-white font-normal inter-var max-w-2xl">
          Get instant answers to your questions about admissions, courses, campus life, and more.
        </p>
        <Link href="/chatbot" passHref>
          <Button className="mt-8 px-6 py-3 text-base md:px-8 md:py-4 md:text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            Chat with Assistant
          </Button>
        </Link>
      </div>
    </WavyBackground>
  );
}