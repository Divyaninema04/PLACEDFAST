# PlacementPilot — Migration, Google OAuth & Firecrawl Setup Guide (Next Steps)

## 🚀 Migration & Fix Summary: MERN Stack + Google OAuth + Firecrawl

The project is fully running on the **MERN Stack** (**MongoDB + Express + React + Node.js**).
Both **Google OAuth** and **Firecrawl Web Scraping** have been resolved at the code level.

---

## 🛠️ What Was Broken & How It Was Fixed

### 1. Google OAuth Authentication
* **The Root Causes**:
  1. `frontend/src/routes/auth.tsx` had a disconnected `handleGoogle` button that simply displayed a toast and navigated to dashboard without contacting Google.
  2. No OAuth 2.0 authorization code redirect flow existed in the backend (`GET /api/auth/google/url` and `GET /api/auth/google/callback` were missing).
  3. `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` were empty in `backend/.env`.
  4. Backend demo fallback threw `Google verification failed` on connection delay instead of returning descriptive setup instructions.
* **The Code-Level Fixes**:
  1. Added `getGoogleAuthUrlHandler` (`GET /api/auth/google/url`) in `auth.controller.ts` to generate the official Google consent screen URL.
  2. Added `googleAuthCallbackHandler` (`GET /api/auth/google/callback`) to exchange authorization codes with Google, verify ID tokens, find or create the student account in MongoDB, and redirect to the frontend with a signed JWT session token (`/auth?token=...`).
  3. Enhanced `googleAuthHandler` (`POST /api/auth/google`) for client-side ID token verification with informative logging and clean error messages.
  4. Updated `frontend/src/routes/auth.tsx` with a `useEffect` listener for incoming tokens/errors from Google redirects and wired the "Continue with Google" button to the authorization URL endpoint.
  5. Updated `frontend/.env.example` to document `VITE_GOOGLE_CLIENT_ID`.

---

### 2. Firecrawl Web Scraping
* **The Root Causes**:
  1. `firecrawl.service.ts` targeted **`https://connector-gateway.lovable.dev/firecrawl/v2`** (Lovable's proprietary proxy) with proprietary headers (`X-Connection-Api-Key` and `Authorization: Bearer <LOVABLE_KEY>`) instead of the official Firecrawl API.
  2. The code enforced a hard blocker: `if (!lovKey || !fcKey)` — refusing to run unless both Lovable and Firecrawl keys were set.
  3. No error body or status code details were logged; failures returned an empty string silently.
* **The Code-Level Fixes**:
  1. Rewrote `backend/src/services/firecrawl.service.ts` to communicate directly with official **`https://api.firecrawl.dev/v1/search`** and **`https://api.firecrawl.dev/v1/scrape`** using standard `Authorization: Bearer ${apiKey}`.
  2. Completely removed dependency on `LOVABLE_API_KEY` and Lovable connector gateways.
  3. Added detailed logging for HTTP 401 (Invalid API key), HTTP 402 (Credit/Quota exhausted), and HTTP 429 (Rate limit).
  4. Added high-quality verified fallback search results when keys are not configured so developer local workflows are never blocked.
  5. Updated `backend/src/services/ai.service.ts` to parse opportunities reliably even when AI gateway keys are missing.

---

## ⚙️ Manual Steps Required from You

### 1. [MANUAL STEP REQUIRED] Configure Google OAuth Credentials
To enable real Google Sign-In with your own Google Cloud project:

1. Open the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create or select a project, then navigate to **APIs & Services > Credentials**.
3. Click **+ CREATE CREDENTIALS > OAuth client ID**.
4. Choose Application Type: **Web application**.
5. Set Name: `PlacementPilot Web`.
6. Add **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:5000`
7. Add **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth`
8. Click **CREATE** and copy your **Client ID** and **Client Secret**.
9. In `backend/.env`, paste:
   ```env
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret
   ```
10. In `frontend/.env`, paste:
    ```env
    VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
    ```

---

### 2. [MANUAL STEP REQUIRED] Configure Firecrawl API Key
To enable real web scraping of live campus opportunities:

1. Go to [firecrawl.dev](https://firecrawl.dev) and sign up for a free account (includes 500 free credits).
2. Go to your Dashboard and copy your API Key (starts with `fc-...`).
3. In `backend/.env`, set:
   ```env
   FIRECRAWL_API_KEY=fc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 3. [MANUAL STEP REQUIRED] Connect to MongoDB
Ensure MongoDB is running either locally or via MongoDB Atlas:

* **Option A: Local MongoDB (Community Server)**:
  ```bash
  mongod
  ```
  `backend/.env` is pre-configured with:
  ```env
  MONGODB_URI=mongodb://localhost:27017/placementpilot
  ```

* **Option B: MongoDB Atlas (Cloud Database - Free Tier)**:
  1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
  2. Create a Database User and whitelist your IP (or `0.0.0.0/0`).
  3. Paste the connection string into `backend/.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/placementpilot?retryWrites=true&w=majority
  ```

---

## 🏃 How to Test Both Features

### Test 1: Testing Firecrawl Web Scraping
You can run this quick verification command in your terminal:
```bash
node -e "import('./backend/dist/services/firecrawl.service.js').then(async m => { const res = await m.firecrawlSearch('Tata Consultancy Services campus placement 2026'); console.log('Length:', res.length); console.log(res.slice(0, 250)); });"
```
* **With `FIRECRAWL_API_KEY` set**: Contacts `https://api.firecrawl.dev/v1/search` and prints live scraped markdown results.
* **Without `FIRECRAWL_API_KEY`**: Prints descriptive warning and returns verified development sources without crashing.

Inside the web application:
1. Navigate to **Opportunities** (`/opportunities`).
2. Click **"Ingest Verified Opportunities"** or trigger a search.

---

### Test 2: Testing Google OAuth Login
1. Open **`http://localhost:5173/auth`** in your browser.
2. Click **"Continue with Google"**.
* **With Google credentials configured**:
  - The browser will redirect to `accounts.google.com` asking you to choose an account.
  - After consent, Google redirects back to `http://localhost:5000/api/auth/google/callback`.
  - The backend exchanges the code, creates/finds your user in MongoDB, and redirects to `http://localhost:5173/auth?token=...`.
  - You will see a success toast: *"Google authentication successful! Welcome to PlacementPilot."* and land on `/dashboard`.
* **Without Google credentials configured**:
  - The application clearly informs you that Google credentials are not yet set in `backend/.env` and enters demo student mode so you are never blocked.

---

## 📦 How to Run the App Locally
In the project root:
```bash
npm run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend API**: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)
