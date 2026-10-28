# Pratham Pancholi — Portfolio

Single-page personal portfolio for a Computer Science student: dark/light theme, searchable project grid, and a floating AI assistant.

**Live URL:** `#`  
TODO: replace with the Vercel production URL after first deploy.

## Features

- Sticky header with smooth-scroll navigation and a sliding theme switch
- Dark (default) / light theme persisted in `localStorage` (`theme`) without a flash on load
- Searchable, filterable project cards from `data/projects.js`
- Contact links plus a front-end message form (`mailto:`)
- Floating chatbot that posts to a Vercel serverless function (`/api/chat`) so the API key never ships to the browser

## Tech stack

- HTML5, CSS3, vanilla JavaScript (no front-end framework, no build step)
- Vercel Node.js serverless function
- Google Gemini `generateContent` API (model name configurable)

## Directory tree

```
portfolio-project/
  index.html
  css/style.css
  js/main.js
  js/chatbot.js
  data/projects.js
  api/chat.js
  assets/profile.jpg      (add your photo; initials fallback if missing)
  assets/icons/           (GitHub, external-link, sun, moon, chat, send, close)
  .gitignore
  .env.example
  README.md
```

## Local setup

1. Install the [Vercel CLI](https://vercel.com/docs/cli) and log in.
2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Put your key in `.env.local` (never commit this file):

   ```
   CHATBOT_API_KEY=your_key_here
   ```

   Optional: `CHATBOT_MODEL=gemini-2.0-flash`

4. From `portfolio-project/`:

   ```bash
   vercel dev
   ```

   Open the local URL the CLI prints (typically `http://localhost:3000`). Static pages work without Vercel, but `/api/chat` needs `vercel dev`.

## Deployment

1. Push this folder to GitHub.
2. Import the repository in [Vercel](https://vercel.com). Set the **Root Directory** to `portfolio-project` if the repo root is the parent folder.
3. In Vercel: **Settings → Environment Variables** → add `CHATBOT_API_KEY` (Production, Preview, Development).
4. Redeploy. Confirm `/api/chat` is available on the live domain.

## Testing

- [ ] Theme switch in the header (desktop and mobile hamburger layout)
- [ ] Theme persists after reload with no wrong-theme flash
- [ ] Five project cards render; GitHub links open in a new tab
- [ ] Search `Python` → projects 1–3; search `Quiz` → project 4 only
- [ ] Chip + search combine; empty state copy appears for nonsense queries
- [ ] Chatbot opens/closes, starter prompts work, typing indicator shows
- [ ] Chatbot error bubble appears if the API key is missing
- [ ] Keyboard: Tab through controls, Space/Enter on the theme switch, Esc closes chat
- [ ] Layout at 360px, 768px, and 1280px

## Profile photo

TODO: add `assets/profile.jpg`. Until then the hero shows an initials fallback.
