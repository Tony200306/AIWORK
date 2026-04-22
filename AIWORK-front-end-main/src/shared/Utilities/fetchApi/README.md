# Overview

`FetchAPI` is a sophisticated utility designed for applications requiring advanced Axios functionality. It enhances the Axios library by offering seamless integration with token-based authentication, request cancellation capabilities, and automatic token refresh logic. This utility is particularly beneficial for projects involving secure API interactions and complex request handling strategies.

# API

The utility enriches the Axios experience with a set of configurations and methods that cater to various advanced requirements. Here's a detailed look at the key components:

### Configurations:

- **`Configure`**: Defines the structure for initial setup, including token management and Axios base configurations.
- **`RefreshTokenConfig`**: Outlines the specifics for handling token refresh scenarios, including URL, conditions, and callbacks.

### Methods:

- **`request`**: A method to initiate API requests, returning an object that includes Axios promise and functions for request cancellation.
- **`setAccessToken`**: Function to retrieve the access token.
- **`setRefreshToken`**: Function to retrieve the refresh token.
- **`setConditionApplyAccessToken`**: Function to determine if the access token should be applied to the request headers.

# Usage

```typescript
// 1. Initializing FetchAPI
import FetchAPI from "path-to-FetchAPI";

const apiService = new FetchAPI({
  baseConfig: {
    /* Axios request config */
  },
  // Other configurations
});

const fetchAPI = apiService.request;

// 2. Making an API Call
const { axiosPromise, axiosCancel } = fetchAPI({
  url: "/endpoint",
  method: "GET",
  // other Axios request config
});

// To handle the response
axiosPromise.then((response) => {
  console.log(response.data);
});

// To cancel the request
axiosCancel();

// 3. Handling Token Refresh
// Configuring the refreshTokenConfig in FetchAPI
const apiService = new FetchAPI({
  // Base and other configurations
  refreshTokenConfig: {
    url: "refresh_token_endpoint",
    // Other token refresh configurations
  },
});

// The utility automatically handles token refresh based on these configurations.

// 4. Integrating with Redux Saga
// Using the reduxSagaCancel token for canceling requests in Redux Saga workflows
const { axiosPromise, abortCancel } = fetchAPI({
  url: "/endpoint",
  cancelToken: "your_redux_saga_cancel_token",
  // other Axios request config
});

// To abort the request in the context of Redux Saga
abortCancel();
```

# Exception

## Handling Parallel Requests and Token Refreshes

When dealing with multiple simultaneous requests, a common challenge is managing token refresh calls. FetchAPI addresses this issue with a synchronized token refresh mechanism, which ensures that only one token refresh happens at a time, even with concurrent requests. This approach prevents redundant requests and maintains consistent authentication states across all requests.

### Implementation Strategy:

1. **Singleton Token Refresh**: The module ensures a single active token refresh call by using a flag (`isRefreshingToken`). Other requests will wait for this process to complete.

2. **Request Queueing**: Requests requiring a token refresh are queued. Once the token is refreshed, all queued requests are retried with the new token.

3. **Synchronized Token State**: The module synchronizes the token state across all requests. As soon as a new token is available, it is immediately used for all subsequent requests.
