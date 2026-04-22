# Overview

The `delay` function provides a straightforward way to introduce a delay in JavaScript code execution. It's built to return a Promise that resolves after a specified duration, making it an essential tool for managing timing in Node.js applications.

# API

### Parameters

- **ms**: `number`: The duration in milliseconds for the delay. Defaults to 0, meaning the Promise resolves immediately.

### Return Value

- Returns a `Promise<void>`, which resolves after the specified delay duration.

# Usage

1. **Introducing a Delay in Execution**

To add a delay of, say, 1000 milliseconds (1 second) in your asynchronous function, you can use the `delay` function as follows:

```typescript
import { delay } from "./path-to-delay-function";

async function performDelayedOperation() {
  console.log("Operation will start after 1 second");
  await delay(1000); // Delay for 1 second
  console.log("Operation started");
}

performDelayedOperation();
```
