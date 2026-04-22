# Overview

The `createResizeObserver` utility is designed to efficiently manage resize events in web applications. It creates an object that provides methods for adding or removing resize listeners. The utility uses `ResizeObserver` for specific elements, with a fallback to window resize event listeners.

# API

The utility exports a function that returns an object containing methods to add and remove resize listeners.

### Functions:

- **`createResizeObserver()`**: Creates and returns an object with listener management methods.
- **`addListener(listener, [element])`**: Adds a resize listener. The listener can be attached to a specific element, or to the document body by default.
- **`removeListener(listener)`**: Removes a previously added resize listener.

### Types:

- **`ResizeObserverListener`**: A allback function with no parameters, invoked when the size of the target element changes.

# Usage

### 1. Create a Resize Observer and Add a ResizeObserverListener

```typescript
const resizeObserver = createResizeObserver();

// Define a listener
const myListener = () => {
  console.log("Resized!");
};

// Add listener to observe an element
resizeObserver.addListener(myListener, someElement);
```

### 2. Remove a ScrollObserverListener

```typescript
// Remove the listener when it's no longer needed
resizeObserver.removeListener(myListener);
```
