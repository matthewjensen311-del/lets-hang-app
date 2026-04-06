import type { UserPreferences, BudgetTier, MatchedPreferences } from '@/types/user';

const BUDGET_ORDER: BudgetTier[] = ['free', 'budget', 'moderate', 'splurge', 'no_limit'];

/**
 * Match preferences across multiple users.
 *
 * - Intersects interests (only interests shared by ALL users)
 * - Picks the lowest (most restrictive) budget tier
 * - Unions all dietary restrictions
 * - Uses majority-rule for energy level and indoor/outdoor preference
 */
export function matchPreferences(
  preferences: UserPreferences[]
): MatchedPreferences {
  if (preferences.length === 0) {
    return {
      sharedInterests: [],
      lowestBudget: 'moderate',
      mergedDietary: [],
      majorityEnergy: 'moderate',
      majorityIndoorOutdoor: 'both',
    };
  }

  // ── Intersect interests ──────────────────────────────────────────────
  let sharedInterests: string[] = [...preferences[0].interests];
  for (let i = 1; i < preferences.length; i++) {
    const currentSet = new Set(preferences[i].interests);
    sharedInterests = sharedInterests.filter((interest) =>
      currentSet.has(interest)
    );
  }

  // ── Lowest budget tier ───────────────────────────────────────────────
  let lowestBudgetIndex = BUDGET_ORDER.length - 1;
  for (const pref of preferences) {
    const idx = BUDGET_ORDER.indexOf(pref.budget_tier);
    if (idx !== -1 && idx < lowestBudgetIndex) {
      lowestBudgetIndex = idx;
    }
  }
  const lowestBudget = BUDGET_ORDER[lowestBudgetIndex];

  // ── Union dietary restrictions ───────────────────────────────────────
  const dietarySet = new Set<string>();
  for (const pref of preferences) {
    for (const restriction of pref.dietary_restrictions) {
      dietarySet.add(restriction);
    }
  }
  const mergedDietary = Array.from(dietarySet);

  // ── Majority-rule energy level ───────────────────────────────────────
  const majorityEnergy = getMajority(
    preferences.map((p) => p.activity_energy),
    'moderate'
  );

  // ── Majority-rule indoor/outdoor ─────────────────────────────────────
  const majorityIndoorOutdoor = getMajority(
    preferences.map((p) => p.indoor_outdoor),
    'both'
  );

  return {
    sharedInterests,
    lowestBudget,
    mergedDietary,
    majorityEnergy,
    majorityIndoorOutdoor,
  };
}

/**
 * Returns the most common value from an array of strings.
 * Falls back to the provided default if the array is empty.
 */
function getMajority(values: string[], fallback: string): string {
  if (values.length === 0) return fallback;

  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let maxCount = 0;
  let majority = fallback;
  for (const [value, count] of counts) {
    if (count > maxCount) {
      maxCount = count;
      majority = value;
    }
  }

  return majority;
}
