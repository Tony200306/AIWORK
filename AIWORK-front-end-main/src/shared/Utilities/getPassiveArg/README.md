# Overview

The `getPassiveArg` function determines the appropriate passive argument based on the browser's support for passive event listeners.

# API

### Parameters

This function doesn't take any parameters.

### Return Value

- Returns: `false | { passive: true }`

  - `false` if passive event listeners are not supported or
  - `{ passive: true }` if passive event listeners are supported.

# Usage

```typescript
import { getPassiveArg } from "./your-module";

const passiveArg = getPassiveArg();
console.log(passiveArg); // Output: false or { passive: true }
```
