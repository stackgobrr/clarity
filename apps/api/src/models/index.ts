/**
 * Shared types and Zod schemas for validation
 */
import { z } from 'zod';

// ============================================================================
// Rubric Dimensions
// ============================================================================

export const RUBRIC_DIMENSIONS = [
  'clarity',
  'relevance',
  'logic',
  'evidence',
  'assumptions',
  'alternatives',
  'quantitative-reasoning',
  'humility-uncertainty',
] as const;

export type RubricDimension = (typeof RUBRIC_DIMENSIONS)[number];

export const RubricDimensionSchema = z.enum(RUBRIC_DIMENSIONS);

// ============================================================================
// Common Schemas
// ============================================================================

export const UUIDSchema = z.string().uuid();
export const ISODateSchema = z.string().datetime();
export const CognitoUserIdSchema = z
  .string()
  .regex(/^[a-z]+-[a-z]+-\d+:[a-f0-9-]+$/);

// ============================================================================
// Answer Schemas
// ============================================================================

export const AnswerSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  answer: z.string().min(1),
  wordCount: z.number().int().nonnegative(),
});

export type Answer = z.infer<typeof AnswerSchema>;

// ============================================================================
// Evaluation Schemas (Bedrock Output)
// ============================================================================

export const DimensionEvaluationSchema = z.object({
  name: RubricDimensionSchema,
  score: z.number().int().min(0).max(4),
  rationale: z.array(z.string()).min(1).max(5),
});

export type DimensionEvaluation = z.infer<typeof DimensionEvaluationSchema>;

export const EvaluationSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.array(DimensionEvaluationSchema).length(8),
  feedback: z.string().optional(),
  modelId: z.string(),
  evaluatedAt: ISODateSchema,
});

export type Evaluation = z.infer<typeof EvaluationSchema>;

// ============================================================================
// Attempt Schemas
// ============================================================================

export const AttemptStatusSchema = z.enum([
  'completed',
  'in-progress',
  'abandoned',
]);

export const AttemptSchema = z.object({
  attemptId: UUIDSchema,
  userId: CognitoUserIdSchema,
  scenarioId: z.string(),
  timestamp: ISODateSchema,
  answers: z.array(AnswerSchema).min(1),
  evaluation: EvaluationSchema,
  durationSeconds: z.number().int().nonnegative(),
  status: AttemptStatusSchema,
});

export type Attempt = z.infer<typeof AttemptSchema>;

// Request to submit an attempt
export const SubmitAttemptRequestSchema = z.object({
  scenarioId: z.string(),
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string().min(10, 'Answer must be at least 10 characters'),
    })
  ),
  durationSeconds: z.number().int().nonnegative().optional(),
});

export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptRequestSchema>;

// ============================================================================
// Profile Schemas
// ============================================================================

export const TrendSchema = z.enum(['improving', 'declining', 'stable']);

export const DimensionStatisticsSchema = z.object({
  name: RubricDimensionSchema,
  movingAverage: z.number().min(0).max(4),
  standardDeviation: z.number().nonnegative(),
  trend: TrendSchema,
  recentScores: z.array(z.number().int().min(0).max(4)),
});

export type DimensionStatistics = z.infer<typeof DimensionStatisticsSchema>;

export const WeaknessSchema = z.object({
  dimension: RubricDimensionSchema,
  score: z.number().min(0).max(4),
  gap: z.number(), // Negative number indicating how far below average
});

export type Weakness = z.infer<typeof WeaknessSchema>;

export const ImprovementSchema = z.object({
  dimension: RubricDimensionSchema,
  improvement: z.number().nonnegative(),
  from: z.number().min(0).max(4),
  to: z.number().min(0).max(4),
});

export type Improvement = z.infer<typeof ImprovementSchema>;

export const ProfileSchema = z.object({
  userId: CognitoUserIdSchema,
  timestamp: ISODateSchema,
  attemptCount: z.number().int().nonnegative(),
  overallAverage: z.number().min(0).max(100),
  dimensions: z.array(DimensionStatisticsSchema).length(8),
  weaknesses: z.array(WeaknessSchema).max(3),
  improvements: z.array(ImprovementSchema).max(3),
  recommendations: z.array(z.string()),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================================
// Scenario Schemas
// ============================================================================

export const QuestionTypeSchema = z.enum(['short', 'long']);

export const QuestionSchema = z.object({
  questionId: z.string(),
  text: z.string().min(10),
  type: QuestionTypeSchema,
  targetWordCount: z.number().int().positive(),
  focusAreas: z.array(RubricDimensionSchema).min(1).max(3),
});

export type Question = z.infer<typeof QuestionSchema>;

export const DifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);

export const ScenarioSchema = z.object({
  scenarioId: z.string(),
  title: z.string().min(5),
  description: z.string().min(50),
  difficulty: DifficultySchema,
  tags: z.array(z.string()),
  questions: z.array(QuestionSchema).min(1).max(10),
  active: z.boolean(),
  createdAt: ISODateSchema,
  estimatedMinutes: z.number().int().positive(),
});

export type Scenario = z.infer<typeof ScenarioSchema>;

// ============================================================================
// Bedrock Request/Response Schemas
// ============================================================================

export const BedrockEvaluationRequestSchema = z.object({
  scenarioId: z.string(),
  scenarioDescription: z.string(),
  questions: z.array(
    z.object({
      questionId: z.string(),
      questionText: z.string(),
      answer: z.string(),
      focusAreas: z.array(RubricDimensionSchema),
    })
  ),
});

export type BedrockEvaluationRequest = z.infer<
  typeof BedrockEvaluationRequestSchema
>;

export const BedrockEvaluationResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  dimensions: z.array(DimensionEvaluationSchema).length(8),
  feedback: z.string().optional(),
});

export type BedrockEvaluationResponse = z.infer<
  typeof BedrockEvaluationResponseSchema
>;

// ============================================================================
// API Response Schemas
// ============================================================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
