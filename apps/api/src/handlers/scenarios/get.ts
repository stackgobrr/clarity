/**
 * Lambda handler for getting a specific scenario
 * GET /scenarios/{id}
 */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { getScenario } from '../../services/scenarios.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const scenarioId = event.pathParameters?.id;

    if (!scenarioId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Scenario ID is required' }),
      };
    }

    // Query DynamoDB for scenario
    const scenario = await getScenario(scenarioId);

    if (!scenario) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Scenario not found' }),
      };
    }

    // Return full scenario with questions
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenario),
    };
  } catch (error) {
    console.error('Error getting scenario:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
