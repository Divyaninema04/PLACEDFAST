# PlacementPilot Frontend

Modern, high-performance Vite + React + TanStack Router single-page application for the PlacementPilot platform.

## Features
- **File-Based Routing**: Over 25 module views powered by `@tanstack/react-router`.
- **Design System**: 42 Radix UI + Tailwind CSS v4 components with custom color tokens and smooth animations.
- **Decoupled API Client**: Communicates with the `backend/` REST API (`/api/*`) and automatically attaches Supabase session tokens.
- **Client-Side Auth**: Supabase Auth with session persistence and preview support.
- **Placement & Skill Intelligence**: Interactive maps, charts (Recharts), and curriculum alignment tools.

## Directory Structure
```
frontend/
├── public/              # Public static assets (favicon, etc.)
├── src/
│   ├── components/      # UI components & design system (Radix + Tailwind)
│   ├── data/            # Regional intelligence & domain demo datasets
│   ├── hooks/           # Custom React hooks (e.g. use-mobile)
│   ├── integrations/    # Supabase browser client & Lovable auth
│   ├── lib/             # Client domain logic, utils, and formatters
│   ├── routes/          # File-based routes (__root, index, auth, _authenticated/*)
│   ├── services/        # API client & AI endpoints caller (api.ts, ai.service.ts)
│   ├── main.tsx         # Application entry point
│   ├── router.tsx       # TanStack Router instance
│   ├── routeTree.gen.ts # Generated route tree
│   └── styles.css       # Tailwind CSS v4 styling
├── index.html           # HTML template
├── vite.config.ts       # Vite build & plugin configuration
├── tsconfig.json        # TypeScript configuration
├── .env                 # Local frontend environment variables
├── .env.example         # Template environment file
├── package.json
└── README.md
```

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and verify your backend URL:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your backend server (default: `http://localhost:5000`).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Production assets are generated in `dist/`.
