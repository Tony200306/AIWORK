# Overview

The `humanizeTimeago` function formats a given date into a human-readable "time-ago" string, supporting multiple locales.

# API

##### Parameters

- `date` (required): The date to be formatted. Can be a `Date` object, a string representing a date, or a number representing a timestamp.
- `locale`: The locale to be used for formatting. Default is `'en'` (English). Supports `'en'` and `'vn'` (Vietnamese).
- `opts`: Optional settings for formatting. Refer to the `timeago.js` documentation for available options.

##### Return Value

- A `string` representing the formatted "time-ago" string.

# Usage

1. Formatting a date to a time-ago string in the default locale (English)

```typescript
import { humanizeTimeago } from "path-to-your-utility-file";

const now = new Date();
console.log(humanizeTimeago({ date: now }));
// Output: "just now"
```

2. Formatting a date to a time-ago string in Vietnamese

```typescript
import { humanizeTimeago } from "path-to-your-utility-file";

const now = new Date();
console.log(humanizeTimeago({ date: now, locale: "vn" }));
// Output: "vừa xong"
```
