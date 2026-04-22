# Effectiveness Score Implementation

## Overview

The Effectiveness Score Calculator has been successfully implemented according to the specification provided. This feature calculates a user's effectiveness score (250-850 range) based on their onboarding responses, using a credit-score-like model to assess risk-to-effort conversion.

## Files Created/Modified

### 1. `/src/utils/calculateEffectiveness.ts` (NEW)
Complete implementation of the effectiveness score calculation algorithm with:

- **Core Calculation Function**: `calculateEffectivenessScore()`
  - Takes `capacity_state`, `task_count`, and `break_pattern` as inputs
  - Returns score with full breakdown of penalties
  - Implements exact formula from specification

- **Quick Path Alternative**: `getArchetypeScore()`
  - Generates randomized scores within archetype ranges
  - Use when full onboarding data isn't available

- **Helper Functions**:
  - `getArchetypeRange()` - Get min/max for an archetype
  - `getArchetypeFromScore()` - Reverse lookup archetype from score
  - `clamp()` - Ensure score stays within valid range
  - `calculateLoadPenalty()` - Task count penalty calculation

- **TypeScript Types**:
  - `CapacityState`: 'breathing_room' | 'tight_fit' | 'overbooked'
  - `BreakPattern`: 'priority_break' | 'energy_break'
  - `Archetype`: All 6 archetype types
  - `EffectivenessScoreInput` & `EffectivenessScoreResult`

### 2. `/src/app/[locale]/(onboarding-layout)/onboarding/capacity-report/page.tsx` (MODIFIED)
Integrated effectiveness score into the Capacity Report page:

- **Data Extraction**: Pulls onboarding responses from Zustand store
- **Mapping Functions**:
  - `mapCapacityFeelingToState()` - Maps 70-100% slider to capacity states
  - `mapConsequencesToBreakPattern()` - Maps consequence options to break patterns
- **Dynamic UI**:
  - Real-time score calculation based on user data
  - Color-coded gauge visualization (4 segments)
  - Score description changes based on value
  - Full penalty breakdown displayed

## Formula Implementation

### Constants
```typescript
MIN_SCORE = 250
MAX_SCORE = 850
BASE_SCORE = 750
```

### Penalties

#### Capacity Penalty
```typescript
breathing_room: 30
tight_fit: 90
overbooked: 180
```

#### Load Penalty (Task Count)
```typescript
< 12 tasks: 0
12-20 tasks: 40
21-30 tasks: 100
> 30 tasks: 180
```

#### Break Pattern Penalty
```typescript
priority_break: 60
energy_break: 100
```

### Final Calculation
```typescript
raw_score = BASE_SCORE - capacity_penalty - load_penalty - break_penalty
effectiveness_score = clamp(raw_score, MIN_SCORE, MAX_SCORE)
```

## Data Flow

1. **User completes onboarding steps**:
   - Capacity Feeling slider (70-100%)
   - Brain Dump (adds tasks)
   - Consequences question (what breaks first)

2. **Data stored in Zustand**:
   - `useOnboardingBraindumpStore` maintains all Q&A and tasks
   - Questions stored as `{ question, answer }` pairs
   - Tasks stored as array in `selected_tasks`

3. **Capacity Report page**:
   - Extracts relevant data from store
   - Maps values to correct types
   - Calculates effectiveness score
   - Displays result with breakdown

## Mapping Logic

### Capacity State Mapping
Based on the capacity-feeling slider (70-100%):
- **70-80%** → `breathing_room` (penalty: 30)
- **85-90%** → `tight_fit` (penalty: 90)
- **95-100%** → `overbooked` (penalty: 180)

### Break Pattern Mapping
Based on consequences question option ID:
- **Options 1-2** → `priority_break` (penalty: 60)
  - Typically: "Missing deadlines", "Quality drops"
- **Options 3-4** → `energy_break` (penalty: 100)
  - Typically: "Burnout", "Health issues"

## Archetype Score Ranges

For quick/fallback scoring:

| Archetype | Score Range |
|-----------|-------------|
| Inefficient Optimizer | 650-720 |
| Low-Return Operator | 580-650 |
| Overcommitted Multitasker | 520-600 |
| Pressure Cooker Performer | 450-550 |
| Chaos Captain | 350-450 |
| Master of Burnouts | 250-350 |

## UI Features

### Gauge Visualization
- 4-color gradient gauge (red → pink → yellow → green)
- Dynamic coloring based on score percentage
- Score displayed in center (actual calculated value)

### Score Description
Dynamic text based on score:
- **≥720**: "quite impressive" (green)
- **≥650**: "above average" (emerald)
- **≥600**: "decent" (yellow)
- **≥550**: "under pressure" (orange)
- **≥450**: "concerning" (red)
- **<450**: "quite low actually" (dark red)

### Penalty Breakdown
Shows all penalties applied:
- Base Score: 750
- Capacity Penalty: -X
- Load Penalty: -Y
- Break Pattern Penalty: -Z
- **Final Score: ABC**

## Usage Examples

### Direct Calculation
```typescript
import { calculateEffectivenessScore } from '@/utils/calculateEffectiveness';

const result = calculateEffectivenessScore({
  capacity_state: 'tight_fit',
  task_count: 15,
  break_pattern: 'priority_break'
});

console.log(result.score); // 560
console.log(result.breakdown);
// {
//   base_score: 750,
//   capacity_penalty: 90,
//   load_penalty: 40,
//   break_penalty: 60,
//   raw_score: 560
// }
```

### Archetype-Based (Quick Path)
```typescript
import { getArchetypeScore } from '@/utils/calculateEffectiveness';

const score = getArchetypeScore('chaos_captain');
console.log(score); // Random: 350-450
```

## Testing Considerations

To test different scenarios, modify the onboarding data:

1. **High Score (720+)**:
   - Capacity: 70-80% (breathing room)
   - Tasks: < 12
   - Break pattern: priority_break

2. **Low Score (<450)**:
   - Capacity: 95-100% (overbooked)
   - Tasks: > 30
   - Break pattern: energy_break

3. **Mid Score (~600)**:
   - Capacity: 85-90% (tight_fit)
   - Tasks: 12-20
   - Break pattern: priority_break

## Future Enhancements

As mentioned in the spec, future versions could include:
- `derivative_click_count` - UI interaction patterns
- `task_diversity` - Variety of task types
- Machine learning model for more nuanced scoring
- Historical score tracking and trends
- Personalized recommendations based on score

## Notes

- The implementation follows the exact penalty tables from the specification
- Scores are bounded to 250-850 range for emotional safety
- The "credit score" metaphor emphasizes structural risk over personal failure
- All calculations happen client-side for immediate feedback
- No backend API calls required for score calculation
