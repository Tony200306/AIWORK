# Overview

The `isBrowser` function determines if the current JavaScript runtime environment is a web browser.

# API

##### Parameters

- None.

##### Return Value

- `true`: If the runtime environment is a web browser.
- `false`: Otherwise.

# Usage

1. Checking if the current environment is a web browser

```typescript
import isBrowser from "path-to-isBrowser";

if (isBrowser()) {
  console.log("Running in a web browser.");
} else {
  console.log("Not running in a web browser.");
}
```
