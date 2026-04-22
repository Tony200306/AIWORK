# Capacity Bar Calculations

This document explains how the capacity bar on the email collector page works.

## Overview

The capacity bar represents the ratio between planned work and intended capacity, using both:
1. User's chosen weekly capacity (hours × desired fullness)
2. Total estimated time of tasks added in brain dump

## Formula

```
capacity_percent = (planned_hours / target_capacity_hours) * 100

Where:
- target_capacity_hours = work_hours * target_fill
- planned_hours = sum(duration_minutes for all tasks) / 60
```

## Inputs

### From Onboarding Questions (stored in `questions` array)

1. **work_hours**: Weekly work hours selected in `capacity-logical` page
   - Example values: 25, 30, 35, 40, 45, 50+ hours

2. **target_fill**: Derived from slider value in `capacity-feeling` page
   - Slider values: 70, 75, 80, 85, 90, 95, 100
   - Mapped to target_fill:
     - 70-80 → 0.75 (Breathing room)
     - 85-90 → 0.875 (Fully engaged)
     - 95-100 → 0.975 (All in)

### From Brain Dump (stored in `selected_tasks` array)

Each task has:
- `kind`: "core", "derivative", "overhead", "life", "manual", "accelerator", etc.
- `est_time`: Optional explicit duration in **HOURS** (e.g., 1.5 = 1 hour 30 minutes)
  - **Important**: The API returns `est_time` in hours, which is converted to minutes internally
- Default durations by kind if `est_time` is not set (in minutes):
  - core: 45 min
  - derivative: 25 min
  - overhead: 15 min
  - life: 30 min
  - manual: 30 min
  - accelerator: Uses default (30 min) or explicit est_time

## Capacity States

The bar color and messaging change based on capacity percentage:

### 🟢 Breathing Room (≤ 85%)
- **Color**: Green (`bg-chart-2`)
- **Headline**: "Your week is planned at {X}% capacity"
- **Supporting**: "You have room this week, but capacity isn't the issue. Where your effort goes is."

### 🟡 Tight Fit (86-100%)
- **Color**: Yellow (`bg-chart-4`)
- **Headline**: "Your week is planned at {X}% capacity"
- **Supporting**: "You are right at the edge of what this week can hold. Small tradeoffs will decide how it goes."

### 🔴 Overbooked (> 100%)
- **Color**: Red (`bg-chart-5`)
- **Headline**: "Your week is planned at {X}% capacity"
- **Supporting**: "This plan assumes more time and energy than you actually have. Something will break."

## Implementation

### Utility Functions

Location: `/src/utils/capacityCalculations.ts`

Key functions:
- `calculateCapacity()`: Main calculation function
- `getTaskDuration()`: Get duration for a task
- `formatTime()`: Format minutes to "Xh Ym" display
- `getCapacityBarColor()`: Get color class for capacity state
- `getCapacityMessages()`: Get headline and supporting text

### Usage in Email Collector

Location: `/src/app/[locale]/(onboarding-layout)/onboarding/email-collector/page.tsx`

```tsx
// Calculate capacity data from store
const capacityData = useMemo(() => {
  // Extract work hours from questions
  const workHours = extractWorkHours(storeData.questions);

  // Extract slider value from questions
  const sliderValue = extractSliderValue(storeData.questions);

  // Calculate capacity metrics
  return calculateCapacity(storeData.selected_tasks, workHours, sliderValue);
}, [storeData.selected_tasks, storeData.questions]);

// Get messages and colors
const capacityMessages = getCapacityMessages(
  capacityData.capacityPercent,
  capacityData.capacityState
);
const barColor = getCapacityBarColor(capacityData.capacityState);
```

## Edge Cases

1. **No work hours selected**: Defaults to 40 hours
2. **No slider value**: Defaults to 85 (Fully engaged)
3. **No tasks**: Shows 0% capacity
4. **Very high capacity (>200%)**: Bar is capped at 100% width, but percentage is displayed accurately
5. **Target capacity is 0**: Returns 0% to avoid division by zero

## Display Format

The capacity info shows:
- **Left side (headline)**: "Your week is planned at {X}% capacity"
- **Progress bar**: Filled from 0-100% (capped at 100% width)
- **Right side (on bar)**: "{target}h cap • {planned}h {m}m planned"
- **Bottom (supporting text)**: Context-specific message based on capacity state

Example: "32h cap • 90h 15m planned" means:
- Target capacity: 32 hours
- Planned work: 90 hours 15 minutes
- Capacity: 282%
