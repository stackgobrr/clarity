/**
 * Utility functions for error handling, logging, validation, etc.
 */

/**
 * Standard API error response builder
 */
export function errorResponse(
  statusCode: number,
  message: string,
  details?: unknown
) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      error: message,
      details,
    }),
  };
}

/**
 * Standard API success response builder
 */
export function successResponse<T>(data: T, statusCode = 200) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

/**
 * Parse and validate Cognito user from JWT token
 */
export function getUserFromToken(_event: unknown): {
  userId: string;
  email: string;
} {
  // TODO: Parse Cognito JWT from authorizer context
  throw new Error('Not implemented');
}
