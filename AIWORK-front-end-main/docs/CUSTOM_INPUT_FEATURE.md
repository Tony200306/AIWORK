# Custom Input Feature - Capacity Logical Page

## Overview

The capacity-logical page now supports a **custom input option** that allows users to enter their own custom work hours instead of selecting from predefined options.

## How It Works

### User Experience

1. **Predefined Options**: User sees standard options (e.g., 25h, 30h, 35h, 40h, 45h, 50h+)
2. **Custom Option**: If one option has a value of "custom" (case-insensitive), it displays an input field when selected
3. **Input Field**: When the custom option is selected, the description is replaced with a number input
4. **Validation**:
   - Only accepts numeric values
   - Min: 1 hour
   - Max: 168 hours (7 days × 24 hours)
   - Next button is disabled until a valid number is entered

### Technical Implementation

#### State Management

```typescript
const [selectedOption, setSelectedOption] = useState<string | null>(null);
const [customValue, setCustomValue] = useState<string>("");
```

- `selectedOption`: Stores the selected option value (including "custom")
- `customValue`: Stores the user's custom numeric input

#### Custom Option Detection

```typescript
const isCustomOption = (value: string) => {
  return value.toLowerCase() === "custom" || value.toLowerCase().includes("custom");
};
```

This helper function checks if an option value represents a custom input option.

#### Validation Logic

```typescript
const isCustom = selectedOption && isCustomOption(selectedOption);
const isCustomValid = isCustom
  ? customValue.trim() !== "" && !isNaN(Number(customValue))
  : true;
const isValid = !!question && selectedOption !== null && isCustomValid;
```

For custom options:
- Checks that customValue is not empty
- Validates that customValue is a valid number

#### Answer Submission

```typescript
const value = isCustomOption(current.selectedOption) && current.customValue
  ? current.customValue
  : current.selectedOption;

current.trackStepCompleted(current.slug, stepIndex, value);
```

- If custom option is selected, submits the `customValue`
- Otherwise, submits the `selectedOption` value

## UI/UX Details

### Card Layout

Each option card:
- Height: 150px (mobile) to 212px (desktop)
- Contains: Icon, Label, Description/Input

### Custom Input Styling

```tsx
<Input
  type="number"
  placeholder="Enter hours"
  value={customValue}
  onChange={(e) => setCustomValue(e.target.value)}
  onClick={(e) => e.stopPropagation()}
  className="mt-2 text-sm bg-background"
  min="1"
  max="168"
/>
```

**Key Features:**
- `onClick` stops propagation to prevent card deselection
- `type="number"` for numeric keyboard on mobile
- `min` and `max` attributes for browser-level validation
- Background matches theme

### State Clearing

When switching away from custom option to another option:

```typescript
onClick={() => {
  setSelectedOption(item.value);
  if (!isCustom) {
    setCustomValue("");
  }
}}
```

This ensures the custom value is cleared when selecting a different option.

## Integration with Capacity Calculations

The custom value flows through to the capacity calculations:

1. **Stored in Questions**: The custom numeric value is saved in the onboarding store
2. **Retrieved in Email Collector**:
   ```typescript
   const workHoursQuestion = storeData.questions.find(
     (q) => q.question.toLowerCase().includes("hours")
   );
   const workHours = workHoursQuestion
     ? parseInt(workHoursQuestion.answer, 10)
     : 40;
   ```
3. **Used in Calculations**: The custom hours value is used to calculate `target_capacity_hours`

## Example Flow

### User enters 42 hours (custom):

1. User clicks "Custom" card
2. Input field appears with placeholder "Enter hours"
3. User types "42"
4. Next button becomes enabled
5. User clicks Next
6. Value "42" is stored as the answer
7. In email collector page:
   - `workHours = 42`
   - `target_capacity_hours = 42 × 0.875 = 36.75` (for "Fully engaged")
8. Capacity bar is calculated based on 36.75 hours capacity

## Backend Expectations

The backend should handle any numeric value for work hours in the onboarding questions. No specific "custom" option needs to be stored in the database - just the numeric value itself.

### Option Configuration Example

```json
{
  "label": "50+ hours",
  "value": "custom",
  "description": "Enter your custom hours"
}
```

When this option is selected and user enters "60", the answer stored is "60", not "custom".
