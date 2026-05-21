# 🔶 ViralKatta CMS

**जळगावचा आवाज** — Complete News CMS with AI-powered scraper, Admin Panel, and Public Portal.

---

## What's Inside

```
ViralKatta/
├── 🌐 Public Portal      → Homepage, Articles, Categories, Search
├── 🔐 Admin Panel        → Dashboard, Queue, Articles, Sources
├── 🤖 AI Scraper         → Auto-scrape + Claude AI rewrite
└── 🗄️  SQLite Database   → Prisma ORM (no setup needed)
```

---

## 🚀 Quick Start (Mac)

### Step 1 — Open in VS Code
```bash
cd viralkatta
code .
```

### Step 2 — Add your Claude API Key
Open `.env.local` and replace:
```
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```
(This is the same key from your old scraper project!)

### Step 3 — Run setup
In VS Code Terminal:
```bash
bash setup.sh
```
This installs packages, creates DB, seeds data.

### Step 4 — Start the CMS
```bash
npm run dev
```

Open **http://localhost:3000** 🎉

### Step 5 — Start the Scraper (separate terminal)
```bash
npm run scraper
```

---

## 📱 URLs

| Page | URL |
|------|-----|
| Public Portal | http://localhost:3000 |
| Admin Login | http://localhost:3000/admin/login |
| Admin Dashboard | http://localhost:3000/admin |
| Pending Queue | http://localhost:3000/admin/queue |
| All Articles | http://localhost:3000/admin/articles |
| Sources | http://localhost:3000/admin/sources |
| DB Studio | `npm run db:studio` |

---

## 🔑 Default Admin Credentials

```
Email:    admin@viralkatta.com
Password: viralkatta@admin
```

> ⚠️ Change these after first login!

---

## 📋 Workflow

```
Scraper runs (every 30 min)
    ↓
Fetches from LiveTrends + RSS + Scrapers
    ↓
Claude AI rewrites in Marathi
    ↓
Article saved as PENDING
    ↓
Admin reviews in Queue page
    ↓
Admin edits if needed + Approves
    ↓
Article PUBLISHED on portal 🎉
```

---

## 🗄️ Database

Using SQLite (file-based, no server needed).
- DB file: `prisma/viralkatta.db`
- View in browser: `npm run db:studio`

---

## ➕ Adding More News Sources

Go to **Admin → Sources** and add:
- WordPress API: `https://yoursite.com/wp-json/wp/v2/posts`
- RSS Feed: `https://yoursite.com/feed/`
- HTML Scraper: just the homepage URL

---

## 🔧 Tech Stack

- **Next.js 14** — Frontend + API routes
- **Prisma + SQLite** — Database (no installation!)
- **NextAuth.js** — Admin authentication
- **Tailwind CSS** — Styling
- **Claude API** — AI Marathi rewriting
- **Node Cron** — Auto-scraping schedule
