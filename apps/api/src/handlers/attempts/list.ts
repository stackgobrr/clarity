/**
 * Lambda handler for listing user attempts
 * GET /attempts?limit={limit}&nextToken={nextToken}
 */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { listAttempts } from '../../services/attempts.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Get userId from Cognito (for MVP, we'll use a test user)
    const userId =
      event.requestContext.authorizer?.claims?.sub || 'test-user-123';

    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit, 10)
      : 20;
    const nextToken = event.queryStringParameters?.nextToken;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Invalid limit. Must be between 1 and 100',
        }),
      };
    }

    // Query DynamoDB for user's attempts
    const result = await listAttempts({
      userId,
      limit,
      ...(nextToken && { nextToken }),
    });

    // Return list of attempts
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error listing attempts:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
