---

# Chitkara University Assistant

Your intelligent gateway for everything Chitkara — from admissions and courses to campus life.

---

## Features

* **Instant Q&A**  
  Get real-time answers to your queries about admissions, programs, campus facilities, university life, and more.

* **Clean, Conversational UI**  
  A friendly, minimalist design that encourages seamless interaction and quick results.

* **Powered by AI (Next.js + Vercel AI SDK)**  
  Built on a solid foundation that enables efficient and scalable AI-driven responses.

---

## Getting Started

### Prerequisites

* Node.js (v16 or higher recommended)
* A Vercel account (for deployment)
* API credentials (e.g., OpenAI key and/or other model provider credentials)

### Setup (Local Development)

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd <repo-directory>
   ```

2. **Copy and configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Populate the `.env.local` file with required credentials (OpenAI key, Vercel KV, etc.). Do **not** commit your `.env.local`.

3. **Install dependencies and run locally**

   ```bash
   npm install
   npm run dev
   ```

   The app should be accessible at `http://localhost:3000`.

### Deployment to Vercel

1. Sign in to Vercel and link your local project:

   ```bash
   npm i -g vercel
   vercel link
   ```

2. Pull environment variables from Vercel (if set up):

   ```bash
   vercel env pull
   ```

3. Deploy:

   ```bash
   vercel
   ```

---

## How It Works

* **Next.js with Vercel AI SDK**  
  Leverages Next.js App Router, React Server Components, and Server Actions for smooth and dynamic UI/UX. ([GitHub][1])

* **Model Provider Flexibility**  
  Uses OpenAI's `gpt-3.5-turbo` by default (or `gpt-4o` in some templates). Easily switch to Anthropic, Cohere, Hugging Face, LangChain, etc., with minimal configuration. ([GitHub][1])

* **State Management**  
  Utilizes Vercel KV (or Vercel Postgres & Blob in some variants) for storing session data and chat history. ([GitHub][1])

* **Tailwind UI Components**  
  Styled with Tailwind CSS and built with Radix UI headless components (via shadcn/ui) for consistent, accessible, and flexible UI. ([GitHub][1])

---

## Usage

1. Visit the deployed site (e.g., `https://chitkarabot.vercel.app/`).
2. Start chatting—ask questions about admissions, programs, campus events, or anything related to Chitkara University.
3. The AI responds conversationally, providing helpful and fast answers.

---

## Customization Ideas

* **Tailor Knowledge Base**  
  Plug in admission FAQs, program overviews, department info, and campus highlights to enrich responses.

* **Add Multilingual Support**  
  Enable support for multiple languages to serve international students.

* **Integrate University Tools**  
  Link with systems like LMS, timetables, contact directories, or event calendars for deeper utility.

* **Enable Advanced Tools**  
  Add functionalities like document uploads, image-based responses, or live notifications using tool integrations.

---

## Contributing

Contributions are always welcome! If you'd like to help refine, expand or improve the chatbot:

1. Fork the repo  
2. Create a feature branch: `git checkout -b feature-xyz`  
3. Make your changes  
4. Submit a pull request describing your changes

---

## License

[Insert your chosen license—MIT, Apache 2.0, or any other] — feel free to customize.

---

## Acknowledgments

This project was inspired by Next.js AI chatbot templates using the Vercel AI SDK, such as the ones created by Vercel’s team. They offer features like streaming chat, flexible model providers, Tailwind-based UI, and KV-backed chat history. ([GitHub][1])

---