# PlacementPilot Backend API

Modern Node.js & Express REST API backend for the PlacementPilot platform.

## Features
- **Company Intelligence**: Live web scraping via Firecrawl & structured placement extraction with AI.
- **AI Career Mentor**: Context-aware student coaching with strict data-trust boundaries.
- **Resume Studio AI**: Profile-grounded resume summaries and bullet point generation.
- **Verified Opportunities Hub**: Real-time opportunity search & verification.
- **Supabase Integration**: Authenticated queries with Bearer token validation and service role admin access.

## Directory Structure
```
backend/
├── src/
│   ├── config/          # Environment & Supabase initialization
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & error handling middlewares
│   ├── models/          # Database TypeScript interfaces
│   ├── routes/          # Express API route endpoints
│   ├── services/        # AI & scraping gateway clients
│   ├── utils/           # Utilities (json-parser, error-handler)
│   └── index.ts         # Server entry point
├── .env                 # Environment variables
├── .env.example         # Template environment file
├── package.json
├── tsconfig.json
└── README.md
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Ensure you have:
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`
- `LOVABLE_API_KEY` (for AI Gateway chat & extraction)
- `FIRECRAWL_API_KEY` (for live web scraping)

### 3. Run Development Server
```bash
npm run dev
```
Server runs on [http://localhost:5000](http://localhost:5000).

### 4. Build for Production
```bash
npm run build
npm start
```
