export const StringMappingToStatusCode = {
  HTTP_SUCCESS: 0,
  HTTP_SERVER_ERROR: 1000,
  HTTP_REQUEST_TIMEOUT: 1001,
  HTTP_BAD_REQUEST: 1002,
  HTTP_UNAUTHORIZED: 1003,
  HTTP_FORBIDDEN: 1004,
  HTTP_NOT_FOUND: 1005,
  HTTP_UNPROCESSABLE_ENTITY: 1006,
  HTTP_TOO_MANY_REQUESTS: 1007,
  HTTP_BAD_GATEWAY: 1008,
  HTTP_GATEWAY_TIMEOUT: 1009,

  NETWORK: 1,
  UNKNOWN: 2,
} as const;

type TStatusCode = Record<
  (typeof StringMappingToStatusCode)[keyof typeof StringMappingToStatusCode],
  keyof typeof StringMappingToStatusCode
>;
export const StatusCodeMappingToString: TStatusCode = Object.fromEntries(
  Object.entries(StringMappingToStatusCode)?.map(([key, value]) => {
    return [value, key];
  }),
) as TStatusCode;
