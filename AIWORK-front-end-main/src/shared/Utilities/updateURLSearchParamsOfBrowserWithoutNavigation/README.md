# Overview

The `updateURLSearchParamsOfBrowserWithoutNavigation` function is designed to update the URL search parameters of the browser without triggering navigation.

# API

#### Parameters

- **searchParams**: An instance of `URLSearchParams` or a string representing the search parameters to be updated.

# Usage

1. Updating URL search parameters without triggering navigation

```javascript
// Define initial search parameters
const initialSearchParams = new URLSearchParams("param1=value1&param2=value2");
// Update search parameters
updateURLSearchParamsOfBrowserWithoutNavigation(initialSearchParams);
```

2. Updating URL search parameters using string representation

```javascript
// Define search parameters as string
const searchParamsString = "param1=value1&param2=value2";
// Update search parameters
updateURLSearchParamsOfBrowserWithoutNavigation(searchParamsString);
```
