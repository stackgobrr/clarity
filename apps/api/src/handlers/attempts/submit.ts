/**
 * Lambda handler for submitting a new attempt
 * POST /attempts
 */
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { SubmitAttemptRequestSchema } from '../../models/index.js';
import { evaluateAttempt } from '../../services/bedrock.js';
import { saveAttempt } from '../../services/attempts.js';
import { getScenario } from '../../services/scenarios.js';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    const body = JSON.parse(event.body);
    const validatedRequest = SubmitAttemptRequestSchema.parse(body);

    // Get userId from Cognito (for MVP, we'll use a test user)
    const userId =
      event.requestContext.authorizer?.claims?.sub || 'test-user-123';

    // Get scenario details
    const scenario = await getScenario(validatedRequest.scenarioId);
    if (!scenario) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Scenario not found' }),
      };
    }

    // Build questions with focus areas for Bedrock
    const questionsForBedrock = validatedRequest.answers.map((answer) => {
      const question = scenario.questions.find(
        (q) => q.questionId === answer.questionId
      );
      if (!question) {
        throw new Error(`Question ${answer.questionId} not found in scenario`);
      }
      return {
        questionId: answer.questionId,
        questionText: question.text,
        answer: answer.answer,
        focusAreas: question.focusAreas,
      };
    });

    // Call Bedrock for evaluation
    const bedrockResponse = await evaluateAttempt({
      scenarioId: validatedRequest.scenarioId,
      scenarioDescription: scenario.description,
      questions: questionsForBedrock,
    });

    // Build answers with word count
    const answersWithWordCount = validatedRequest.answers.map((answer) => {
      const question = scenario.questions.find(
        (q) => q.questionId === answer.questionId
      );
      return {
        questionId: answer.questionId,
        questionText: question!.text,
        answer: answer.answer,
        wordCount: answer.answer.split(/\s+/).filter(Boolean).length,
      };
    });

    // Save attempt to DynamoDB
    const attemptId = randomUUID();
    const timestamp = new Date().toISOString();
    const modelId =
      process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';

    const attempt = await saveAttempt({
      attemptId,
      userId,
      scenarioId: validatedRequest.scenarioId,
      answers: answersWithWordCount,
      evaluation: {
        overallScore: bedrockResponse.overallScore,
        dimensions: bedrockResponse.dimensions,
        ...(bedrockResponse.feedback && { feedback: bedrockResponse.feedback }),
        modelId,
        evaluatedAt: timestamp,
      },
      timestamp,
      durationSeconds: 0, // MVP: not tracking duration yet
      status: 'completed',
    });

    // Return evaluation results
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attemptId: attempt.attemptId,
        evaluation: attempt.evaluation,
      }),
    };
  } catch (error) {
    console.error('Error submitting attempt:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Validation error',
          details: error.message,
        }),
      };
    }

    // Handle other errors
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
