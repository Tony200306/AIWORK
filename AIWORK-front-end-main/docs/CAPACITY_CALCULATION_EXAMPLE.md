# Capacity Calculation Example

This document provides a real-world example of how the capacity calculation works.

## Example Scenario

### User Inputs (from onboarding)

**Step 1: Capacity Logical** (work hours per week)
- User selects: **40 hours**

**Step 2: Capacity Feeling** (slider value)
- User selects: **85%** (Fully engaged)
- Maps to `target_fill`: **0.875**

### Tasks from Brain Dump

User adds the following tasks:

| Task | Kind | est_time (hours) | Duration (minutes) |
|------|------|------------------|-------------------|
| Update workflow tracker | accelerator | 1.5 | 90 |
| Review design docs | core | - | 45 (default) |
| Schedule team meeting | overhead | - | 15 (default) |
| Finish project proposal | core | 2.0 | 120 |
| Code review PRs | derivative | - | 25 (default) |
| Update documentation | overhead | - | 15 (default) |
| Plan sprint goals | core | - | 45 (default) |

## Calculation Steps

### Step A: Target Capacity Hours
```
target_capacity_hours = work_hours × target_fill
target_capacity_hours = 40 × 0.875
target_capacity_hours = 35 hours
```

### Step B: Planned Load Hours
```
planned_minutes = 90 + 45 + 15 + 120 + 25 + 15 + 45
planned_minutes = 355 minutes
planned_hours = 355 ÷ 60
planned_hours = 5.92 hours
```

### Step C: Capacity Percent
```
capacity_percent = (planned_hours ÷ target_capacity_hours) × 100
capacity_percent = (5.92 ÷ 35) × 100
capacity_percent = 16.9%
```

### Step D: Capacity State
Since **16.9% ≤ 85%**, the state is: **🟢 Breathing Room**

## Display Output

**Headline:**
> Your week is planned at 17% capacity

**Progress Bar:**
- Color: Green (`bg-chart-2`)
- Fill width: 17%

**Info Text (on bar):**
> 35h cap • 5h 55m planned

**Supporting Text:**
> You have room this week, but capacity isn't the issue. Where your effort goes is.

---

## Overbooked Example

Let's say the user adds many more tasks with a total of **3000 minutes (50 hours)**:

### Calculation
```
target_capacity_hours = 35 hours (same as above)
planned_hours = 3000 ÷ 60 = 50 hours
capacity_percent = (50 ÷ 35) × 100 = 142.9%
```

### Result: 🔴 Overbooked

**Headline:**
> Your week is planned at 143% capacity

**Progress Bar:**
- Color: Red (`bg-chart-5`)
- Fill width: **100%** (capped, but percentage shows 143%)

**Info Text:**
> 35h cap • 50h planned

**Supporting Text:**
> This plan assumes more time and energy than you actually have. Something will break.

---

## Key Takeaways

1. **est_time is in hours**: Tasks from the API have `est_time` in hours (e.g., 1.5 = 90 minutes)
2. **Default durations**: If `est_time` is not set, we use defaults by task kind
3. **Bar is capped at 100%**: Even if capacity is 250%, the bar fills to 100% max
4. **Percentage is always shown**: The actual percentage (e.g., 250%) is displayed in the headline
5. **Three states**:
   - ≤85% = Breathing Room (green)
   - 86-100% = Tight Fit (yellow)
   - >100% = Overbooked (red)
