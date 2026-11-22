# Wordbox Trainer 🎯
> **Dedicated Plato Wordbox 5×5 Mastery & 400+ Points Practice Engine**

Wordbox Trainer is a specialized, browser-based training platform engineered specifically to help players achieve **400+ points in Plato's Wordbox (5×5, 60-second mode)**.

---

## 🏆 The 400+ Points Strategy Formula

In Plato Wordbox 60-second mode, scoring 400+ points requires an average pace of **6.67 points per second** (~45–55 words per round).

### Why 3-Letter Words Are Point Traps:
- **3 Letters:** 1 Point (Submitting a 3-letter word consumes ~1.2s for only 1 point = 50 pts/min pace).
- **4 Letters:** 6 Points (**600% increase!** Submitting 4-letter words generates 300+ pts/min).
- **5 Letters:** 8 Points.
- **6 Letters:** 10 Points.
- **7 Letters:** 12 Points.
- **8+ Letters:** 14 Points.
- **Blue Bonus Tile:** Adds **+3 extra points** to any word passing through it (turns a 4-letter word into 9 points and a 5-letter word into 11 points!).

### Core Plato 400+ Techniques Built into the Trainer:
1. **The Suffix Chaining Method (Morphing):** Find a root (e.g. `CARE`) and rapidly sweep variations without lifting your finger:
   `CARE` (6 pts) → `CARES` (8 pts) → `CARED` (8 pts) → `CARER` (8 pts) → `CARERS` (10 pts) → `CARING` (10 pts) = **50 points in 4 seconds**!
2. **Blue Bonus Tile Anchoring:** Locate the Blue Tile early. If it's a common vowel (`E`, `A`) or consonant (`S`, `T`, `R`), loop 10+ words through it for an instant +30 to +45 bonus points.
3. **The 2-Second S-Check:** Immediately identify all `S` tiles at round start to convert singular nouns and present-tense verbs into high-scoring plurals.

---

## 🕹️ Training Modes

1. **60-Second Practice (Ranked Simulation):**
   - Standard 60.00-second countdown with millisecond precision.
   - Real-time pace gauge tracking your current Points/Minute rate against the 400-point benchmark.
   - Instant transition to deep post-round analytics.

2. **Untimed Exploration (Deep Scan):**
   - Practice scanning the 5×5 board without clock pressure.
   - Track board clearance percentage.
   - Click "End Exploration & Reveal All Words" to inspect all missed words.

3. **Target Practice (Long Word Drill):**
   - Focus specifically on finding longer words (5, 6, 7, or 8+ letters).
   - Track quota completion and historical success rates for each word length.

4. **Board Replay & Path Inspector:**
   - Replay any previous board from history.
   - Click ANY word in the found or missed lists to see its exact path drawn on the 5×5 grid with numbered steps and animated connection arrows.

---

## 📚 Lexicon & Scoring Transparency

- **Dictionary:** **ENABLE1 Benchmark English Lexicon** (172,727 words). This is the public domain tournament reference for Words With Friends and Boggle variants.
- **Scoring Rules:** Defaults to **Plato Wordbox Official** (`3L=1, 4L=6, 5L=8, 6L=10, 7L=12, 8+L=14, Blue Bonus=+3`). Fully customizable under Trainer Settings.
- **Board Generation:** 
  - *Competitive 400+ Generator:* Guarantees 32%–40% vowels, rich affix hubs (`S`, `ED`, `ER`, `ING`), and $\ge 200$ valid words and $\ge 1800$ potential points.
  - *Official Big Boggle 25-Dice Simulation:* Rolls authentic Hasbro 25-dice faces.
  - *English Corpus Weighted:* Natural statistical distribution.
  - *Custom 25 Letters:* Input any custom 25-letter board.

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+ (tested on Node v20 & v22)
- npm

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run Quality Control test suite
npx tsx scripts/test_wordbox.ts

# 3. Start local development server
npm run dev

# 4. Open in your browser
# Navigate to: http://localhost:3000
```

---

## ⌨️ Controls & Input Methods
- **Mouse / Trackpad:** Click and drag across adjacent tiles; release to submit (or click tiles sequentially and hit Enter / double-click last tile).
- **Touchscreen / Mobile:** Touch and swipe smoothly across letters (touch-action disabled on grid to prevent scrolling).
- **Keyboard:** Type letters directly! The engine automatically selects adjacent matching tiles. Press `Enter` to submit, `Backspace` to undo, `Esc` to clear.
