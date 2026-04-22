# Overview

The `webLocalStorage` module provides a `Storage`-like object that uses either the browser's native `window.localStorage` if available or falls back to an in-memory storage mechanism.

# API

An object that mimics the behavior of `window.localStorage`. It checks for the availability of native `localStorage` and falls back to an in-memory storage if it's not available.

# Usage

1. Storing a key-value pair

```typescript
webLocalStorage.setItem("username", "JohnDoe");
```

2. Retrieving a value

```typescript
const username = webLocalStorage.getItem("username"); // Output: "JohnDoe"
```

3. Removing a key-value pair

```typescript
webLocalStorage.removeItem("username");
```

4. Clearing all stored key-value pairs

```typescript
webLocalStorage.clear();
```
