# Roadmap

## Project Goal
Self-researching CRO board for samsung.com/au. Daily 3-5 CRO ideas with MiniMax mockups. Tinder-like interactive interface.

## Milestones

### ✅ M1: Foundation — Research & Architecture
- ~~Scrape and analyze samsung.com/au~~
- ~~Research CRO best practices~~
- ~~Define system architecture~~
- ~~Design schema and component tree~~
- **Status: Complete.** Iris delivered detailed Samsung AU analysis (20+ components, 10 opportunity zones). Theo delivered full architecture (Next.js + Prisma + Vercel). Zara identified blockers and gaps.

### ✅ M2: Idea Generation Pipeline — LLM + Seed Data
- ~~Build LLM-based CRO idea generator module using Iris's research as knowledge base~~
- ~~Fix Prisma schema issues (status enum, category FK relation, batch tracking)~~
- ~~Create seed script that generates CRO ideas with full structure~~
- ~~Frontend pages: swipe, liked, dislike with full CRUD~~
- **Status: Complete.** All code compiles clean. Generator module with pluggable LLM clients (Claude, GPT-4o, Mock). Knowledge base embedding Iris's full research. 20 high-quality mock LLM template ideas (rated 8/10 by Iris review). Prompts with Samsung AU-specific context. API route with secret auth. Seed script with 10 Samsung-specific ideas. CLI script for manual generation. Frontend features: card swipe (button-based), like/dislike, liked/disliked pages with move-between, category badges, expandable details. TypeScript compiles cleanly.

### M3: MiniMax Image API Integration (CURRENT)
- Integrate MiniMax Image API for mockup generation
- Generate mockups for existing and new ideas
- Store images in Vercel Blob
- Mockup display, loading states, fallback on API failure

### M4: Frontend Polish — Swipe Gestures & UX
- Add Framer Motion for drag-to-swipe gesture (Tinder-like)
- Card stack depth effect (next card peeking underneath)
- Undo last action functionality
- Keyboard navigation
- Mobile-responsive swipe behavior
- Image loading skeletons

### M5: Daily Scheduling & Integration
- Vercel Cron or GitHub Actions for daily pipeline trigger
- Full autonomous pipeline: research → generate → mockup → store
- Error handling, retry logic, logging
- Deduplication of ideas across batches
- Final integration testing and deploy

## Lessons Learned

### From M1 Research
1. **Scraping is the #1 risk.** Samsung.com/au is JS-heavy (React SPA) with likely anti-bot measures. Mitigation: Use Iris's static research as the LLM's knowledge base, defer live scraping to later. Puppeteer + stealth plugin when we do add it.
2. **The codebase is already scaffolded.** A working Next.js app exists in `repo-chat/` (git worktree) with Prisma schema, API routes, and all three pages (swipe, liked, dislike). M4/M5 frontend work is partially done — focus M2-M3 on the pipeline.
3. **Schema needs fixes before data accumulates.** Status should be an enum not a bare string. Category should be a FK relation. Add batch tracking fields.
4. **MiniMax needs testing first.** Before committing to full integration, test the API with 10+ UI mockup prompts to assess quality. Have a placeholder fallback.
5. **Start with curated seed, not live scraping.** Use Iris's detailed site analysis to ground the LLM. Add live scraping as a v2 enhancement once the core flow works.
6. **3-5 ideas/day is realistic** — LLM generation ~15s/idea, MiniMax ~20s/image. Batch of 5 ideas ≈ 3-5 minutes total with parallel execution.

### From M2 Pipeline
7. **Mock LLM templates are production-quality.** Iris's CRO review rated 14/20 templates excellent or good. Templates cover 10 categories with deep Samsung AU specificity (AU pricing, Afterpay, trade-in program, Australian warranty).
8. **Gap: comparison tools.** No templates cover product comparison or "Help Me Choose" quizzes — critical for electronics e-commerce. Should be addressed in future batches.
9. **Gap: mobile depth.** Only 1/20 templates targets mobile specifically despite mobile traffic dominance. Needs more coverage.
10. **Mockup prompts need cleanup for production.** Remove animation descriptors, add aspect ratios, add negative prompts, trim to 80-120 words before feeding to MiniMax.
11. **Missing dependency.** `tsx` is not in devDependencies but is needed for seed and CLI scripts (`npx tsx prisma/seed.ts`, `npx tsx scripts/generate-ideas.ts`).
