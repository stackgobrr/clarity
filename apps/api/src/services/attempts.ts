/**
 * Attempts service
 * Handles DynamoDB operations for attempt records
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  type PutCommandInput,
  type GetCommandInput,
  type QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { AttemptSchema, type Attempt } from '../models/index.js';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.ATTEMPTS_TABLE_NAME || 'clarity-attempts';
const USER_INDEX_NAME = 'userId-timestamp-index';

export interface SaveAttemptParams {
  attemptId: string;
  userId: string;
  scenarioId: string;
  answers: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    wordCount: number;
  }>;
  evaluation: {
    overallScore: number;
    dimensions: Array<{
      name:
        | 'clarity'
        | 'relevance'
        | 'logic'
        | 'evidence'
        | 'assumptions'
        | 'alternatives'
        | 'quantitative-reasoning'
        | 'humility-uncertainty';
      score: number;
      rationale: string[];
    }>;
    feedback?: string;
    modelId: string;
    evaluatedAt: string;
  };
  timestamp: string;
  durationSeconds: number;
  status: 'completed' | 'in-progress' | 'abandoned';
}

export interface ListAttemptsParams {
  userId: string;
  limit?: number;
  nextToken?: string;
}

export interface ListAttemptsResponse {
  attempts: Attempt[];
  nextToken?: string | undefined;
}

/**
 * Save a new attempt to DynamoDB
 */
export async function saveAttempt(params: SaveAttemptParams): Promise<Attempt> {
  const attempt: Attempt = {
    attemptId: params.attemptId,
    userId: params.userId,
    scenarioId: params.scenarioId,
    answers: params.answers,
    evaluation: params.evaluation,
    timestamp: params.timestamp,
    durationSeconds: params.durationSeconds,
    status: params.status,
  };

  // Validate with Zod
  const validated = AttemptSchema.parse(attempt);

  const input: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: validated,
  };

  const command = new PutCommand(input);
  await docClient.send(command);

  return validated;
}

/**
 * Get an attempt by ID
 */
export async function getAttempt(attemptId: string): Promise<Attempt | null> {
  const input: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: {
      attemptId,
    },
  };

  const command = new GetCommand(input);
  const response = await docClient.send(command);

  if (!response.Item) {
    return null;
  }

  // Validate with Zod
  const validated = AttemptSchema.parse(response.Item);
  return validated;
}

/**
 * List attempts for a user (sorted by timestamp descending)
 */
export async function listAttempts(
  params: ListAttemptsParams
): Promise<ListAttemptsResponse> {
  const input: QueryCommandInput = {
    TableName: TABLE_NAME,
    IndexName: USER_INDEX_NAME,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': params.userId,
    },
    ScanIndexForward: false, // Descending order (newest first)
    Limit: params.limit || 20,
  };

  if (params.nextToken) {
    input.ExclusiveStartKey = JSON.parse(
      Buffer.from(params.nextToken, 'base64').toString('utf-8')
    );
  }

  const command = new QueryCommand(input);
  const response = await docClient.send(command);

  const attempts = (response.Items || []).map((item) =>
    AttemptSchema.parse(item)
  );

  let nextToken: string | undefined;
  if (response.LastEvaluatedKey) {
    nextToken = Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
      'base64'
    );
  }

  return {
    attempts,
    nextToken,
  };
}

// Deprecated interface - keeping for compatibility
export interface AttemptRecord {
  attemptId: string;
  userId: string;
  scenarioId: string;
  timestamp: string;
  answers: Array<{
    questionId: string;
    answer: string;
  }>;
  evaluation: {
    overallScore: number;
    dimensions: Array<{
      name: string;
      score: number;
      rationale: string[];
    }>;
  };
}
