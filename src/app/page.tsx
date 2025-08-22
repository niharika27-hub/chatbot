import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-center mb-6">
        Welcome to Chitkara University Assistant
      </h1>
      <p className="text-lg text-center mb-8 max-w-prose">
        Your AI-powered guide to everything about Chitkara University. Ask me
        about admissions, courses, placements, campus life, transport, clubs,
        or more!
      </p>
      <Link href="/chatbot" passHref>
        <Button size="lg" className="text-lg px-8 py-4">
          Start Chatting
        </Button>
      </Link>
    </div>
  );
}