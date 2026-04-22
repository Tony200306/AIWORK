# Overview

The `pluralize` function determines the appropriate pluralization of a word based on the count provided.

# API

##### Parameters

- `count` (number): The count of items for which pluralization is being applied.
- `singular` (string): The singular form of the word.
- `plural` (string): The plural form of the word.

##### Return Value

- The appropriate pluralization based on the count.

# Usage

1. Pluralizing a word based on count:

```javascript
import pluralize from "path-to-pluralize";

const result = pluralize({ count: 5, singular: "apple", plural: "apples" });
console.log(result); // Output: 'apples'
```
