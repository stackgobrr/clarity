/**
 * Shared types and Zod schemas for validation
 * These will be expanded in work item 01-rubric-and-data-model
 */

// TODO: Add Zod schemas for:
// - Attempt submission request/response
// - Profile data structures
// - Scenario structures
// - Bedrock evaluation input/output
// - Rubric dimensions and scoring

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
