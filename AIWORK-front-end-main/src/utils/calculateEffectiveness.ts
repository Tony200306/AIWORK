/**
 * VANTUM EFFECTIVENESS SCORE CALCULATOR
 * Credit-score model for risk to effort conversion
 *
 * Score Range: 250-850
 * Base Score: 750 (assumes effort, intent, and competence)
 *
 * Penalties represent structural risk, not failure:
 * - Capacity penalties = over-commitment risk
 * - Load penalties = utilization risk
 * - Break penalties = conversion failure type
 */

// ============================================================================
// TYPES
// ============================================================================

export type CapacityState = 'breathing_room' | 'tight_fit' | 'overbooked';
export type BreakPattern = 'priority_break' | 'energy_break';
export type Archetype =
  | 'inefficient_optimizer'
  | 'low_return_operator'
  | 'overcommitted_multitasker'
  | 'pressure_cooker_performer'
  | 'chaos_captain'
  | 'master_of_burnouts';

export interface EffectivenessScoreInput {
  capacity_state: CapacityState;
  task_count: number;
  break_pattern: BreakPattern;
}

export interface EffectivenessScoreResult {
  score: number;
  breakdown: {
    base_score: number;
    capacity_penalty: number;
    load_penalty: number;
    break_penalty: number;
    raw_score: number;
  };
}

export interface ArchetypeScoreRange {
  min: number;
  max: number;
}

export interface ArchetypeInstructions {
  howItShowsUp: string;
  whatBreaksFirst: string;
  whatChangesThis: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_SCORE = 250;
const MAX_SCORE = 850;
const BASE_SCORE = 750;

const CAPACITY_PENALTIES: Record<CapacityState, number> = {
  breathing_room: 30,
  tight_fit: 90,
  overbooked: 180,
};

const BREAK_PENALTIES: Record<BreakPattern, number> = {
  priority_break: 60,
  energy_break: 100,
};

const ARCHETYPE_RANGES: Record<Archetype, ArchetypeScoreRange> = {
  inefficient_optimizer: { min: 650, max: 720 },
  low_return_operator: { min: 580, max: 650 },
  overcommitted_multitasker: { min: 520, max: 600 },
  pressure_cooker_performer: { min: 450, max: 550 },
  chaos_captain: { min: 350, max: 450 },
  master_of_burnouts: { min: 250, max: 350 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate load penalty based on task count
 */
function calculateLoadPenalty(task_count: number): number {
  if (task_count < 12) return 0;
  if (task_count >= 12 && task_count <= 20) return 40;
  if (task_count >= 21 && task_count <= 30) return 100;
  return 180; // task_count > 30
}

// ============================================================================
// MAIN CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate effectiveness score using the credit-score model
 *
 * @param input - Onboarding and brain dump data
 * @returns Effectiveness score (250-850) with breakdown
 *
 * @example
 * ```typescript
 * const result = calculateEffectivenessScore({
 *   capacity_state: 'tight_fit',
 *   task_count: 15,
 *   break_pattern: 'priority_break'
 * });
 * console.log(result.score); // 560
 * ```
 */
export function calculateEffectivenessScore(
  input: EffectivenessScoreInput
): EffectivenessScoreResult {
  const { capacity_state, task_count, break_pattern } = input;

  // Get penalties
  const capacity_penalty = CAPACITY_PENALTIES[capacity_state];
  const load_penalty = calculateLoadPenalty(task_count);
  const break_penalty = BREAK_PENALTIES[break_pattern];

  // Calculate raw score
  const raw_score = BASE_SCORE - capacity_penalty - load_penalty - break_penalty;

  // Clamp to valid range
  const score = clamp(raw_score, MIN_SCORE, MAX_SCORE);

  return {
    score,
    breakdown: {
      base_score: BASE_SCORE,
      capacity_penalty,
      load_penalty,
      break_penalty,
      raw_score,
    },
  };
}

/**
 * Generate a randomized score within the archetype's typical range
 * (Quick path alternative when full calculation isn't available)
 *
 * @param archetype - User's archetype
 * @returns Random score within archetype range
 *
 * @example
 * ```typescript
 * const score = getArchetypeScore('chaos_captain');
 * console.log(score); // Random number between 350-450
 * ```
 */
export function getArchetypeScore(archetype: Archetype): number {
  const range = ARCHETYPE_RANGES[archetype];
  const randomScore = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  return randomScore;
}

/**
 * Get the archetype range for display purposes
 *
 * @param archetype - User's archetype
 * @returns Score range object
 */
export function getArchetypeRange(archetype: Archetype): ArchetypeScoreRange {
  return ARCHETYPE_RANGES[archetype];
}

/**
 * Determine archetype based on effectiveness score
 * (Reverse lookup - useful for categorizing calculated scores)
 *
 * @param score - Calculated effectiveness score
 * @returns Matching archetype or null if score is invalid
 */
export function getArchetypeFromScore(score: number): Archetype | null {
  if (score < MIN_SCORE || score > MAX_SCORE) return null;

  for (const [archetype, range] of Object.entries(ARCHETYPE_RANGES)) {
    if (score >= range.min && score <= range.max) {
      return archetype as Archetype;
    }
  }

  // Edge case: score is in a gap between ranges
  // Return the closest archetype
  if (score > 720) return 'inefficient_optimizer';
  if (score > 650) return 'low_return_operator';
  if (score > 600) return 'overcommitted_multitasker';
  if (score > 550) return 'pressure_cooker_performer';
  if (score > 450) return 'chaos_captain';
  return 'master_of_burnouts';
}

/**
 * Convert archetype enum to human-readable display text
 *
 * @param archetype - The archetype enum value
 * @returns Formatted display text
 *
 * @example
 * ```typescript
 * const text = getArchetypeDisplayText('chaos_captain');
 * console.log(text); // "Chaos Captain"
 * ```
 */
export function getArchetypeDisplayText(archetype: Archetype): string {
  const textMap: Record<Archetype, string> = {
    inefficient_optimizer: 'Inefficient Optimizer',
    low_return_operator: 'Low-Return Operator',
    overcommitted_multitasker: 'Overcommitted Multitasker',
    pressure_cooker_performer: 'Pressure Cooker Performer',
    chaos_captain: 'Chaos Captain',
    master_of_burnouts: 'Master of Burnouts',
  };

  return textMap[archetype];
}

/**
 * Get archetype display text directly from score
 *
 * @param score - Calculated effectiveness score
 * @returns Formatted display text or fallback message
 *
 * @example
 * ```typescript
 * const text = getArchetypeTextFromScore(420);
 * console.log(text); // "Chaos Captain"
 * ```
 */
export function getArchetypeTextFromScore(score: number): string {
  const archetype = getArchetypeFromScore(score);
  if (!archetype) return 'Unknown Profile';
  return getArchetypeDisplayText(archetype);
}

/**
 * Get archetype image path from archetype enum
 *
 * @param archetype - The archetype enum value
 * @returns Image path relative to /public directory
 *
 * @example
 * ```typescript
 * const imagePath = getArchetypeImage('chaos_captain');
 * console.log(imagePath); // "/image/chaos captain.png"
 * ```
 */
export function getArchetypeImage(archetype: Archetype): string {
  const imageMap: Record<Archetype, string> = {
    inefficient_optimizer: '/image/inefficentoptimizer.png',
    low_return_operator: '/image/lowreturnoperator.png',
    overcommitted_multitasker: '/image/overcommittedmultitasker.png',
    pressure_cooker_performer: '/image/pressurecookerperformer.png',
    chaos_captain: '/image/chaos captain.png',
    master_of_burnouts: '/image/masterburnouts.png',
  };

  return imageMap[archetype];
}

/**
 * Get archetype image path directly from score
 *
 * @param score - Calculated effectiveness score
 * @returns Image path or fallback image
 *
 * @example
 * ```typescript
 * const imagePath = getArchetypeImageFromScore(420);
 * console.log(imagePath); // "/image/chaos captain.png"
 *
 * // Usage in Next.js Image component
 * <Image src={getArchetypeImageFromScore(score)} alt="Archetype" width={128} height={128} />
 * ```
 */
export function getArchetypeImageFromScore(score: number): string {
  const archetype = getArchetypeFromScore(score);
  if (!archetype) return '/image/chaos captain.png'; // fallback image
  return getArchetypeImage(archetype);
}

/**
 * Get Tailwind gradient classes for archetype text styling
 *
 * @param archetype - The archetype enum value
 * @returns Tailwind CSS gradient classes
 *
 * @example
 * ```typescript
 * const gradient = getArchetypeColor('inefficient_optimizer');
 * console.log(gradient); // "from-green-400 to-emerald-500"
 *
 * // Usage in component
 * <h1 className={`bg-gradient-to-r ${getArchetypeColor(archetype)} bg-clip-text text-transparent`}>
 *   {archetypeName}
 * </h1>
 * ```
 */
export function getArchetypeColor(archetype: Archetype): string {
  const colorMap: Record<Archetype, string> = {
    inefficient_optimizer: 'from-green-400 to-emerald-500',      // Green - Best score
    low_return_operator: 'from-yellow-400 to-yellow-500',        // Yellow - Middle
    overcommitted_multitasker: 'from-yellow-400 to-orange-400',  // Yellow-Orange - Middle
    pressure_cooker_performer: 'from-orange-400 to-orange-500',  // Orange - Getting worse
    chaos_captain: 'from-orange-500 to-red-500',                 // Orange-Red - Bad
    master_of_burnouts: 'from-red-500 to-red-600',               // Red - Worst score
  };

  return colorMap[archetype];
}

/**
 * Get Tailwind gradient classes directly from score
 *
 * @param score - Calculated effectiveness score
 * @returns Tailwind CSS gradient classes or fallback
 *
 * @example
 * ```typescript
 * const gradient = getArchetypeColorFromScore(420);
 * console.log(gradient); // "from-orange-500 to-red-500"
 *
 * // Usage in component
 * <h1 className={`bg-gradient-to-r ${getArchetypeColorFromScore(score)} bg-clip-text text-transparent`}>
 *   {archetypeName}
 * </h1>
 * ```
 */
export function getArchetypeColorFromScore(score: number): string {
  const archetype = getArchetypeFromScore(score);
  if (!archetype) return 'from-gray-400 to-gray-500'; // fallback
  return getArchetypeColor(archetype);
}

/**
 * Get archetype description text
 *
 * @param archetype - The archetype enum value
 * @returns Detailed description of the archetype
 *
 * @example
 * ```typescript
 * const description = getArchetypeDescription('chaos_captain');
 * console.log(description);
 * // "Your week isn't planned — it's reacted to. Urgent demands steer the ship..."
 * ```
 */
export function getArchetypeDescription(archetype: Archetype): string {
  const descriptionMap: Record<Archetype, string> = {
    inefficient_optimizer:
      "You put in real effort and stay busy — but the returns don't compound. There's room in your week, yet progress spreads instead of stacking. Nothing is broken, but nothing is anchored either.",

    low_return_operator:
      "You work hard — but progress doesn't come back in proportion. Energy goes out steadily, results come back thin. It's not overload. It's leakage.",

    overcommitted_multitasker:
      "You're capable, but everything matters at once. Your week is packed just tightly enough to force tradeoffs. Progress happens — but rarely without compromise.",

    pressure_cooker_performer:
      "You deliver — but it costs you. The week holds together because you push yourself to make it work. Intensity replaces margin.",

    chaos_captain:
      "Your week isn't planned — it's reacted to. Urgent demands steer the ship while priorities fight for space. You're always moving, rarely steering.",

    master_of_burnouts:
      "You're operating beyond limits — repeatedly. The system keeps asking more, and you keep supplying it. Eventually, something gives — then the cycle resets.",
  };

  return descriptionMap[archetype];
}

/**
 * Get archetype description directly from score
 *
 * @param score - Calculated effectiveness score
 * @returns Archetype description or fallback message
 *
 * @example
 * ```typescript
 * const description = getArchetypeDescriptionFromScore(420);
 * console.log(description);
 * // Returns Chaos Captain description
 * ```
 */
export function getArchetypeDescriptionFromScore(score: number): string {
  const archetype = getArchetypeFromScore(score);
  if (!archetype) return 'Your effectiveness profile could not be determined. Please complete the onboarding assessment.';
  return getArchetypeDescription(archetype);
}

/**
 * Get archetype instructions with 3 parts
 *
 * @param archetype - The archetype enum value
 * @returns Instructions object with howItShowsUp, whatBreaksFirst, whatChangesThis
 *
 * @example
 * ```typescript
 * const instructions = getArchetypeInstructions('chaos_captain');
 * console.log(instructions.howItShowsUp);
 * console.log(instructions.whatBreaksFirst);
 * console.log(instructions.whatChangesThis);
 * ```
 */
export function getArchetypeInstructions(archetype: Archetype): ArchetypeInstructions {
  const instructionsMap: Record<Archetype, ArchetypeInstructions> = {
    inefficient_optimizer: {
      howItShowsUp: "You keep adding tasks. You stay engaged. But the work doesn't stack — it spreads. You revisit the same problems. You lose thread between sessions. Small things take longer than they should because context never quite carries over.",
      whatBreaksFirst: "Momentum. You rarely finish what you start with enough energy left to continue. Instead, you restart constantly — just one step behind your own progress.",
      whatChangesThis: "Reduce input. Not effort. Work on fewer things for longer. Let decisions repeat. Let routines calcify. Track what you finish — not what you start. That simple lag is your diagnostic.",
    },
    low_return_operator: {
      howItShowsUp: "You're consistent. You put in effort. But results come out thin. You work more to deliver less. Tasks slip through cracks you didn't know existed. Effort doesn't correlate with outcome — and that confuses you.",
      whatBreaksFirst: "Trust in your process. You start second-guessing decisions. You add steps to compensate. That adds drag without adding lift.",
      whatChangesThis: "Stop improving. Start eliminating. Cut tasks that don't return clear value within one cycle. Shrink your workflow to half its current size. You're not underperforming — you're under-filtering.",
    },
    overcommitted_multitasker: {
      howItShowsUp: "You deliver — but never quite comfortably. You're always trading one priority for another. Something always gets delayed. Nothing catastrophic breaks, but nothing really lands clean either.",
      whatBreaksFirst: "Flexibility. You can't absorb surprises. One curveball breaks the whole week. You hold it together — but just barely.",
      whatChangesThis: "Kill one priority entirely. Not delay it. Kill it. Then give yourself two open slots per week. Not for work. For recovery. Your load isn't fatal — but it's unsustainable. That margin is the difference.",
    },
    pressure_cooker_performer: {
      howItShowsUp: "You perform under pressure — but only because you've made pressure your baseline. You push. You override your limits. You deliver — but the cost is mounting, even if you can't see it yet.",
      whatBreaksFirst: "Your body. Or your relationships. Or your judgment. You won't notice until the break is loud.",
      whatChangesThis: "Stop delivering at 100%. Deliver at 80% and study what breaks. Most things won't. That gap is where you'll find leverage. But you have to stop running hot long enough to notice.",
    },
    chaos_captain: {
      howItShowsUp: "Your week is reactive. Urgent demands replace planned priorities. You're in motion constantly — but not toward anything you chose. You're fighting fires. Fires you didn't start.",
      whatBreaksFirst: "Direction. You lose sight of the mission. Tasks multiply. Progress stalls. You stay busy — but nothing meaningful advances.",
      whatChangesThis: "Block one hour per day. No input allowed. No interruptions. Use it to decide what you will not do. Chaos isn't your fault. But navigation is your job. That hour is the helm.",
    },
    master_of_burnouts: {
      howItShowsUp: "You say yes when you should say no. You override signals from your body. You deliver — until you can't. Then you collapse. Then you recover and repeat. The system depends on it. You've accepted it. But it's not sustainable.",
      whatBreaksFirst: "Everything. Eventually. Health. Relationships. Performance. Output. The only question is which one breaks first — and whether you'll stop before the second one does.",
      whatChangesThis: "Stop now. Not later. Now. Decline half your commitments. Take a week off if possible. Then rebuild from 50% load and add back slowly. You're not weak. You're overdrawn. This isn't optional. It's diagnostic.",
    },
  };

  return instructionsMap[archetype];
}

/**
 * Get archetype instructions directly from score
 *
 * @param score - Calculated effectiveness score
 * @returns Instructions object or fallback
 *
 * @example
 * ```typescript
 * const instructions = getArchetypeInstructionsFromScore(420);
 * console.log(instructions.howItShowsUp);
 * ```
 */
export function getArchetypeInstructionsFromScore(score: number): ArchetypeInstructions {
  const archetype = getArchetypeFromScore(score);
  if (!archetype) {
    return {
      howItShowsUp: 'Unable to determine your work pattern.',
      whatBreaksFirst: 'Unable to assess risk factors.',
      whatChangesThis: 'Please complete the onboarding assessment to receive personalized guidance.',
    };
  }
  return getArchetypeInstructions(archetype);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  calculateEffectivenessScore,
  getArchetypeScore,
  getArchetypeRange,
  getArchetypeFromScore,
  getArchetypeDisplayText,
  getArchetypeTextFromScore,
  getArchetypeImage,
  getArchetypeImageFromScore,
  getArchetypeColor,
  getArchetypeColorFromScore,
  getArchetypeDescription,
  getArchetypeDescriptionFromScore,
  getArchetypeInstructions,
  getArchetypeInstructionsFromScore,
  MIN_SCORE,
  MAX_SCORE,
  BASE_SCORE,
};
