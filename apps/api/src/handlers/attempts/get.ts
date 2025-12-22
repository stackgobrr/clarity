/**
 * Lambda handler for retrieving an attempt by ID
 * GET /attempts/{id}
 */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getAttempt } from '../../services/attempts.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const attemptId = event.pathParameters?.id;

    if (!attemptId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Attempt ID is required' }),
      };
    }

    // Get userId from Cognito (for MVP, we'll use a test user)
    const userId =
      event.requestContext.authorizer?.claims?.sub || 'test-user-123';

    // Query DynamoDB for attempt
    const attempt = await getAttempt(attemptId);

    if (!attempt) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Attempt not found' }),
      };
    }

    // Check authorization (user can only access their own attempts)
    if (attempt.userId !== userId) {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    // Return attempt data
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
    };
  } catch (error) {
    console.error('Error getting attempt:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
