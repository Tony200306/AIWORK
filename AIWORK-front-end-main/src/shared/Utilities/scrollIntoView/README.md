# Overview

The `scrollIntoView` function enables smooth scrolling to a specified element within the DOM. It takes the ID of an HTML element and optional parameters to customize the scrolling behavior, alignment, and position.

# API

##### Parameters

- **elementId**: The ID of the HTML element to scroll into view.
- **behavior**: Optional. The scroll behavior ('auto' or 'smooth'). Defaults to 'smooth'.
- **block**: Optional. The vertical alignment ('start', 'center', 'end', 'nearest'). Defaults to 'start'.
- **inline**: Optional. The horizontal alignment ('start', 'center', 'end', 'nearest'). Defaults to 'nearest'.

##### Return value

This function does not return a value. It performs the scrolling action.

# Usage

```typescript
scrollIntoView(element, "auto", "end", "center");
```
