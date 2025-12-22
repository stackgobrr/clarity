/**
 * Lambda handler for listing available scenario sets
 * GET /scenarios
 */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { listScenarios } from '../../services/scenarios.js';

export const handler: APIGatewayProxyHandler = async () => {
  try {
    // Query for active scenarios
    const scenarios = await listScenarios();

    // Return list with metadata
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarios }),
    };
  } catch (error) {
    console.error('Error listing scenarios:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
