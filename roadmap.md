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

### ✅ M3: MiniMax Image API Integration
- ~~Integrate MiniMax Image API for mockup generation~~
- ~~Generate mockups for existing and new ideas~~
- ~~Store images in Vercel Blob~~
- ~~Mockup display, loading states, fallback on API failure~~
- **Status: Complete.** Apollo VERIFY_PASS. 8 deliverables verified: MiniMax client with full error handling, Vercel Blob storage, POST /api/research/mockup route, CLI batch script (--idea-id, --batch, --all-pending), MockupImage (3 states), SkeletonCard, prompt cleanup (80-120 words, no animation descriptors), tsx in devDependencies. TypeScript compiles clean (tsconfig needs minor fix — see M4 prep).

### ⚠️ M4: Frontend Polish — Swipe Gestures & UX
- ~~Add Framer Motion for drag-to-swipe gesture (Tinder-like)~~
- ~~Card stack depth effect (next card peeking underneath)~~
- ~~Undo last action functionality~~
- ~~Keyboard navigation~~
- ~~Mobile-responsive swipe behavior~~
- ~~Image loading skeletons on swipe page~~
- ~~Fix tsconfig.json moduleResolution issue~~
- ~~Fix API race condition in page.tsx (await PATCH before advancing index)~~
- ~~Create shared types file (eliminate 4x duplicated CROIdea interfaces)~~
- ~~Add `previousStatus` field to Prisma schema for undo support~~
- ~~Add undo API endpoint~~
- ~~Create custom hooks (useIdeas, useUpdateIdea, useSwipeKeyboard)~~
- **Status: Code complete in `ares/m4-integration` branch, not yet merged.** Athena's team evaluated: Iris (UX: 7.5/10), Theo (M5 readiness: 70%), Zara (spec gap analysis: 8 met, 3 partial, 2 unmet). **4 critical issues found** — see M4.1.

### 🔄 M4.1: Fix Critical M4 Issues & Merge (CURRENT)
- Fix swipe exit animation (card snaps back instead of flying off-screen) — Iris finding #1
- Improve card stack visibility (increase vertical offset to 40px, differentiate shadows)
- Add safe-area padding for mobile (env(safe-area-inset-bottom) on toast + portal buttons)
- Fix auth bypass on generate endpoint (inconsistent `!researchSecret` check vs mockup route)
- Fix category upsert race condition (findUnique+create → upsert)
- Merge `ares/m4-integration` → `main`
- **Cycles budget: 5**

### M5: Daily Scheduling & Integration
- Vercel Cron job for daily pipeline trigger
- Full autonomous pipeline: research → generate → mockup → store
- Unified pipeline runner (single entry point, not 2 separate scripts)
- Retry logic for LLM + MiniMax calls (3 attempts, exponential backoff)
- Deduplication of ideas across batches (prompt-based negative examples + title similarity check)
- Structured logging for cron monitoring
- Environment variable validation at startup + health check endpoint
- `.env.example` with all required vars
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

### From M3 MiniMax Integration
12. **Prompt quality matters enormously for mockups.** Animation descriptors ("pulsing", "slide-up", "fade-in") produce unusable static mockups. Clean them aggressively. The 80-120 word sweet spot gives MiniMax enough detail without over-constraining. Negative prompts are essential for UI mockups — without them, MiniMax generates photorealistic product shots instead of wireframe UI.
13. **Vercel Blob is reliable but needs timeout.** The download utility must have `AbortSignal.timeout(30_000)` — missing this caused silent hangs during testing. Every external fetch needs a timeout.
14. **Schema fields that aren't persisted to DB are dead code.** `aspectRatio` and `negativePrompt` were in the SeedIdea interface but never passed to `prisma.cROIdea.create()`. These should be applied at the API layer (via minimax-client), not stored per-idea. Clean dead fields promptly.
15. **The repo has a tsconfig issue.** `moduleResolution: "bundler"` works for most bundlers but `tsc --noEmit` requires `"node"`. The tsconfig needs fixing — it's a one-line change but blocks CI-type checks.
16. **M3 is code-complete but untested end-to-end.** MiniMax API key and Vercel Blob token are env vars that may not be set in all environments. The code handles this gracefully (throws descriptive errors), but actual image generation hasn't been verified with real API calls.

### From M4 Frontend Polish
17. **Swipe exit animation is the #1 UX issue.** `dragConstraints: { left: 0, right: 0 }` prevents the card from flying off-screen — it awkwardly snaps back to center before disappearing. The `decided` animate keys in CROCard are dead code. Fix: remove dragConstraints, let animate handle exit, fire onLike/onDislike on `onAnimationComplete`.
18. **Card stack depth is structurally sound but visually weak.** 15px vertical offset barely shows cards underneath. Use 40px offset with differentiated shadows.
19. **Undo is well-implemented but limited.** Toast pattern is gold-standard. Missing: keyboard shortcut (Cmd+Z), no undo from liked/disliked pages, no persistence across page navigation.
20. **Keyboard navigation is the strongest feature (9/10).** Clean, isolated hook, form-field-aware, prevents scroll. Only gap: no visual hint for discoverability.
21. **Mobile has critical gaps.** No safe-area padding, no haptic feedback, card height (520px) may overflow on iPhone SE. Action button portal overlaps with undo toast.
22. **Auth bypass on generate endpoint.** `if (researchSecret && body.secret !== researchSecret)` silently bypasses when env var is unset. Mockup endpoint uses correct strict check. One-line fix.
23. **Category upsert race condition.** `findUnique` then `create` is a TOCTOU bug. Two concurrent requests could violate the unique slug constraint. Fix: `prisma.category.upsert()`.
24. **No deduplication anywhere.** Schema has `batchId` for provenance but no dedup logic. M5 needs pre-generation prompt-based dedup + post-generation title similarity check.
25. **Retry logic is completely absent.** LLM failures return empty array. MiniMax 429 throws but never retries. Every external API call needs a retry wrapper.
26. **The types.ts unification is perfect (10/10).** Single source of truth, all components import from `@/lib/types`. No competing interfaces found.
