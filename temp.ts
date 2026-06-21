/**
 * Seed script: populate DsaSheetRecommendation collection
 *
 * Run once (or re-run safely — upsert semantics):
 *   ts-node scripts/seedDsaRecommendations.ts
 *
 * Goal values match exactly what the frontend sends (goalOptionsByJourney titles).
 * Level / timeline values match the backend enums.
 */

import mongoose from 'mongoose';
import DsaSheetRecommendationModel from '../model/dsaSheetRecommendation.model';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Level    = 'beginner' | 'intermediate' | 'good' | 'confident';
type Timeline = 'lt3' | 'bw3and6' | 'bw6and12' | 'mt12';

interface RecommendationRow {
  goal:     string;
  level:    Level;
  timeline: Timeline;
  sheets:   string[];
}



const GOALS = {
  PLACEMENTS:  'Preparing for Placements / Internships',
  INTERVIEW:   'Prepare for an Upcoming Interview',
  DSA:         'Improving DSA / Competitive Programming',
  JOB_SWITCH:  'Prepare for Job Switch',
} as const;


const S = {
  STRIVER_SDE:      'Striver SDE Sheet',
  STRIVER_A2Z:      'Strivers A2Z DSA Sheet',
  NEETCODE_150:     'Neetcode 150',
  NEETCODE_250:     'Neetcode 250',
  TOP_150:          'Top Interview 150',
  BLIND_75:         'Blind 75',
  LOVE_BABBAR:      'Love Babbar Sheet',
  CSES:             'CSES Problem Set',
  DSA_PATTERNS:     '20 Essential DSA Patterns',
  GOOGLE:           'Google Sheet',
  AMAZON:           'Amazon Sheet',
  LC_100:           'Leetcode 100 Most Liked Questions',
  DP_MASTERY:       'DP Mastery Sheet',
  GRAPH_MASTERY:    'Graph Mastery Sheet',
  BS_MASTERY:       'Binary Search Mastery Sheet',
  CP31_800:         '800 R ated CP-31 Sheet',
  CP31_1000:        '1000-1200 Rated CP-31 Sheet',
  CP31_1200:        '1200-1400 Rated CP-31 Sheet',
  A2OJ_800_1299:    '800-1299 A2OJ Ladder',
  A2OJ_800_1499:    '800-1499 A2OJ Ladder',
  A2OJ_1400_1700:   '1400-1700 A2OJ Ladder',
  A2OJ_1700_2200:   '1700-2200 A2OJ Ladder',
} as const;

// ---------------------------------------------------------------------------
// Seed data  (64 rows, derived 1-to-1 from the Excel)
// ---------------------------------------------------------------------------

const SEED_DATA: RecommendationRow[] = [

  // ── Placements / Internships ─────────────────────────────────────────────
  { goal: GOALS.PLACEMENTS, level: 'beginner',     timeline: 'lt3',      sheets: [S.STRIVER_SDE,  S.NEETCODE_150,  S.DSA_PATTERNS,  S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'beginner',     timeline: 'bw3and6',  sheets: [S.STRIVER_A2Z,  S.STRIVER_A2Z,   S.STRIVER_A2Z,   S.STRIVER_A2Z] },
  { goal: GOALS.PLACEMENTS, level: 'beginner',     timeline: 'bw6and12', sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'beginner',     timeline: 'mt12',     sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.CSES] },

  { goal: GOALS.PLACEMENTS, level: 'intermediate', timeline: 'lt3',      sheets: [S.STRIVER_SDE,  S.NEETCODE_150,  S.DSA_PATTERNS,  S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'intermediate', timeline: 'bw3and6',  sheets: [S.STRIVER_SDE,  S.DSA_PATTERNS,  S.TOP_150,       S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'intermediate', timeline: 'bw6and12', sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'intermediate', timeline: 'mt12',     sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.CSES] },

  { goal: GOALS.PLACEMENTS, level: 'good',         timeline: 'lt3',      sheets: [S.STRIVER_SDE,  S.GOOGLE,        S.TOP_150,       S.LC_100] },
  { goal: GOALS.PLACEMENTS, level: 'good',         timeline: 'bw3and6',  sheets: [S.TOP_150,      S.DSA_PATTERNS,  S.DP_MASTERY,    S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'good',         timeline: 'bw6and12', sheets: [S.TOP_150,      S.LC_100,        S.DP_MASTERY,    S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'good',         timeline: 'mt12',     sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.CSES] },

  { goal: GOALS.PLACEMENTS, level: 'confident',    timeline: 'lt3',      sheets: [S.STRIVER_SDE,  S.GOOGLE,        S.TOP_150,       S.LC_100] },
  { goal: GOALS.PLACEMENTS, level: 'confident',    timeline: 'bw3and6',  sheets: [S.TOP_150,      S.DSA_PATTERNS,  S.DP_MASTERY,    S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'confident',    timeline: 'bw6and12', sheets: [S.TOP_150,      S.LC_100,        S.DP_MASTERY,    S.GOOGLE] },
  { goal: GOALS.PLACEMENTS, level: 'confident',    timeline: 'mt12',     sheets: [S.STRIVER_A2Z,  S.LOVE_BABBAR,   S.NEETCODE_250,  S.CSES] },

  // ── Prepare for an Upcoming Interview ────────────────────────────────────
  { goal: GOALS.INTERVIEW, level: 'beginner',     timeline: 'lt3',      sheets: [S.BLIND_75,    S.TOP_150,     S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'beginner',     timeline: 'bw3and6',  sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'beginner',     timeline: 'bw6and12', sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'beginner',     timeline: 'mt12',     sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },

  { goal: GOALS.INTERVIEW, level: 'intermediate', timeline: 'lt3',      sheets: [S.BLIND_75,    S.TOP_150,     S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'intermediate', timeline: 'bw3and6',  sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'intermediate', timeline: 'bw6and12', sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'intermediate', timeline: 'mt12',     sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },

  { goal: GOALS.INTERVIEW, level: 'good',         timeline: 'lt3',      sheets: [S.BLIND_75,    S.TOP_150,     S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'good',         timeline: 'bw3and6',  sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'good',         timeline: 'bw6and12', sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'good',         timeline: 'mt12',     sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },

  { goal: GOALS.INTERVIEW, level: 'confident',    timeline: 'lt3',      sheets: [S.BLIND_75,    S.TOP_150,     S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'confident',    timeline: 'bw3and6',  sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'confident',    timeline: 'bw6and12', sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },
  { goal: GOALS.INTERVIEW, level: 'confident',    timeline: 'mt12',     sheets: [S.TOP_150,     S.STRIVER_SDE, S.GOOGLE,       S.AMAZON] },

  // ── Improving DSA / Competitive Programming ───────────────────────────────
  { goal: GOALS.DSA, level: 'beginner',     timeline: 'lt3',      sheets: [S.DSA_PATTERNS,   S.NEETCODE_150,  S.CP31_800,      S.CSES] },
  { goal: GOALS.DSA, level: 'beginner',     timeline: 'bw3and6',  sheets: [S.STRIVER_A2Z,    S.CSES,          S.A2OJ_800_1299, S.LOVE_BABBAR] },
  { goal: GOALS.DSA, level: 'beginner',     timeline: 'bw6and12', sheets: [S.STRIVER_A2Z,    S.NEETCODE_250,  S.A2OJ_800_1299, S.CSES] },
  { goal: GOALS.DSA, level: 'beginner',     timeline: 'mt12',     sheets: [S.CSES,            S.STRIVER_A2Z,   S.NEETCODE_250,  S.A2OJ_800_1499] },

  { goal: GOALS.DSA, level: 'intermediate', timeline: 'lt3',      sheets: [S.DSA_PATTERNS,   S.NEETCODE_150,  S.CP31_800,      S.CSES] },
  { goal: GOALS.DSA, level: 'intermediate', timeline: 'bw3and6',  sheets: [S.STRIVER_A2Z,    S.CSES,          S.A2OJ_800_1299, S.LOVE_BABBAR] },
  { goal: GOALS.DSA, level: 'intermediate', timeline: 'bw6and12', sheets: [S.STRIVER_A2Z,    S.NEETCODE_250,  S.A2OJ_800_1299, S.CSES] },
  { goal: GOALS.DSA, level: 'intermediate', timeline: 'mt12',     sheets: [S.CSES,            S.STRIVER_A2Z,   S.NEETCODE_250,  S.A2OJ_800_1499] },

  { goal: GOALS.DSA, level: 'good',         timeline: 'lt3',      sheets: [S.CSES,            S.GRAPH_MASTERY, S.DP_MASTERY,    S.CP31_1000] },
  { goal: GOALS.DSA, level: 'good',         timeline: 'bw3and6',  sheets: [S.DP_MASTERY,      S.CSES,          S.GRAPH_MASTERY, S.CP31_1200] },
  { goal: GOALS.DSA, level: 'good',         timeline: 'bw6and12', sheets: [S.A2OJ_1400_1700,  S.DP_MASTERY,    S.CSES,          S.BS_MASTERY] },
  { goal: GOALS.DSA, level: 'good',         timeline: 'mt12',     sheets: [S.CSES,            S.DP_MASTERY,    S.BS_MASTERY,    S.A2OJ_1700_2200] },

  { goal: GOALS.DSA, level: 'confident',    timeline: 'lt3',      sheets: [S.CSES,            S.GRAPH_MASTERY, S.DP_MASTERY,    S.CP31_1000] },
  { goal: GOALS.DSA, level: 'confident',    timeline: 'bw3and6',  sheets: [S.DP_MASTERY,      S.CSES,          S.GRAPH_MASTERY, S.CP31_1200] },
  { goal: GOALS.DSA, level: 'confident',    timeline: 'bw6and12', sheets: [S.A2OJ_1400_1700,  S.DP_MASTERY,    S.CSES,          S.BS_MASTERY] },
  { goal: GOALS.DSA, level: 'confident',    timeline: 'mt12',     sheets: [S.CSES,            S.DP_MASTERY,    S.BS_MASTERY,    S.A2OJ_1700_2200] },

  // ── Prepare for Job Switch ────────────────────────────────────────────────
  { goal: GOALS.JOB_SWITCH, level: 'beginner',     timeline: 'lt3',      sheets: [S.STRIVER_SDE, S.NEETCODE_150,  S.DSA_PATTERNS, S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'beginner',     timeline: 'bw3and6',  sheets: [S.STRIVER_A2Z, S.STRIVER_A2Z,   S.STRIVER_A2Z,  S.STRIVER_A2Z] },
  { goal: GOALS.JOB_SWITCH, level: 'beginner',     timeline: 'bw6and12', sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'beginner',     timeline: 'mt12',     sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.CSES] },

  { goal: GOALS.JOB_SWITCH, level: 'intermediate', timeline: 'lt3',      sheets: [S.STRIVER_SDE, S.NEETCODE_150,  S.DSA_PATTERNS, S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'intermediate', timeline: 'bw3and6',  sheets: [S.STRIVER_SDE, S.DSA_PATTERNS,  S.TOP_150,      S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'intermediate', timeline: 'bw6and12', sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'intermediate', timeline: 'mt12',     sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.CSES] },

  { goal: GOALS.JOB_SWITCH, level: 'good',         timeline: 'lt3',      sheets: [S.STRIVER_SDE, S.GOOGLE,        S.TOP_150,      S.LC_100] },
  { goal: GOALS.JOB_SWITCH, level: 'good',         timeline: 'bw3and6',  sheets: [S.TOP_150,     S.DSA_PATTERNS,  S.DP_MASTERY,   S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'good',         timeline: 'bw6and12', sheets: [S.TOP_150,     S.LC_100,        S.DP_MASTERY,   S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'good',         timeline: 'mt12',     sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.CSES] },

  { goal: GOALS.JOB_SWITCH, level: 'confident',    timeline: 'lt3',      sheets: [S.STRIVER_SDE, S.GOOGLE,        S.TOP_150,      S.LC_100] },
  { goal: GOALS.JOB_SWITCH, level: 'confident',    timeline: 'bw3and6',  sheets: [S.TOP_150,     S.DSA_PATTERNS,  S.DP_MASTERY,   S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'confident',    timeline: 'bw6and12', sheets: [S.TOP_150,     S.LC_100,        S.DP_MASTERY,   S.GOOGLE] },
  { goal: GOALS.JOB_SWITCH, level: 'confident',    timeline: 'mt12',     sheets: [S.STRIVER_A2Z, S.LOVE_BABBAR,   S.NEETCODE_250, S.CSES] },
];

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/codolio';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  let inserted = 0;
  let skipped  = 0;

  for (const row of SEED_DATA) {
    const result = await DsaSheetRecommendationModel.updateOne(
      { goal: row.goal, level: row.level, timeline: row.timeline },
      { $set: { sheets: row.sheets } },
      { upsert: true }
    );
    if (result.upsertedCount) inserted++;
    else skipped++;
  }

  console.log(`Seed complete — inserted: ${inserted}, already existed (skipped): ${skipped}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});