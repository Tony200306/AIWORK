# Overview

The `dayjsOverride` function extends the capabilities of the Day.js library, offering enhanced functionality for parsing and manipulating dates in JavaScript applications. This override is designed for client-side usage, providing a powerful method for handling date and time operations.

# API

### Parameters

| Parameter | Type               | Description                                                 |
| --------- | ------------------ | ----------------------------------------------------------- |
| input     | `dayjs.ConfigType` | The date, string, or timestamp to be parsed or manipulated. |
| format    | `dayjs.OptionType` | The format of the input, if applicable.                     |
| locale    | `string`           | The locale to be used for formatting.                       |
| strict    | `boolean`          | Whether to perform strict parsing.                          |

### Return Value

Returns a `dayjs.Dayjs` object representing the parsed or manipulated date.

# Server-Side Warning

If used on the server side, the function throws an error with a warning about potential issues related to timezone offsets. It is recommended to use Day.js for client-side tasks. For server-side operations, consider using libraries designed for server environments and timestamp handling.

# Usage

```typescript
if (isBrowser()) {
  const result = dayjsOverride("2024-03-07", "YYYY-MM-DD");
  console.log(result.format("MMMM DD, YYYY")); // Outputs: "March 07, 2024"
} else {
  console.error("Day.jsOverride should be used in a browser environment.");
}
```
