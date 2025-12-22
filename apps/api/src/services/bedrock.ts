/**
 * Bedrock evaluation service
 * Handles all interactions with AWS Bedrock for critical thinking evaluation
 */
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  type InvokeModelCommandInput,
} from '@aws-sdk/client-bedrock-runtime';
import {
  BedrockEvaluationRequestSchema,
  BedrockEvaluationResponseSchema,
  type BedrockEvaluationRequest,
  type BedrockEvaluationResponse,
} from '../models/index.js';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

const MODEL_ID =
  process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0';
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Invokes Bedrock to evaluate an attempt against the rubric
 * Returns structured JSON output only
 */
export async function evaluateAttempt(
  request: BedrockEvaluationRequest
): Promise<BedrockEvaluationResponse> {
  // Validate input
  BedrockEvaluationRequestSchema.parse(request);

  const prompt = buildPrompt(request);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await invokeBedrock(prompt);
      const evaluation = parseAndValidateResponse(response);
      return evaluation;
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error('Bedrock evaluation failed after retries:', error);
        throw new Error('Failed to evaluate attempt after retries');
      }
      console.warn(`Bedrock attempt ${attempt + 1} failed, retrying...`, error);
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  throw new Error('Unexpected error in evaluateAttempt');
}

/**
 * Build the prompt for Bedrock
 */
function buildPrompt(request: BedrockEvaluationRequest): string {
  const questionText = request.questions
    .map(
      (q, idx) => `
## Question ${idx + 1}: ${q.questionText}

**User's Answer:**
${q.answer}

**Focus Areas:** ${q.focusAreas.join(', ')}
`
    )
    .join('\n');

  return `# Scenario
${request.scenarioDescription}

# Questions and Answers
${questionText}

# Evaluation Task

Evaluate the user's answers across all 8 critical thinking dimensions using the rubric below.

## Rubric

### 1. Clarity (0-4)
- 0: Vague, ambiguous, incomprehensible
- 1: Major ambiguities, unclear main point
- 2: Moderately clear with some imprecision
- 3: Clear with minor imprecision
- 4: Exceptionally clear and precise

### 2. Relevance (0-4)
- 0: Does not address the question
- 1: Marginally relevant with major tangents
- 2: Relevant but includes tangents
- 3: Mostly relevant with minor tangents
- 4: Completely relevant throughout

### 3. Logic (0-4)
- 0: Illogical or contradictory
- 1: Major logical flaws
- 2: Some logical reasoning with gaps
- 3: Logical with minor gaps
- 4: Rigorous logical structure

### 4. Evidence (0-4)
- 0: No evidence provided
- 1: Minimal or anecdotal evidence
- 2: Some evidence but incomplete
- 3: Good evidence with minor gaps
- 4: Strong, diverse evidence

### 5. Assumptions (0-4)
- 0: Ignores assumptions entirely
- 1: Acknowledges assumptions exist
- 2: Identifies some assumptions
- 3: Identifies and tests assumptions
- 4: Rigorously examines assumptions

### 6. Alternatives (0-4)
- 0: Ignores alternatives
- 1: Acknowledges alternatives exist
- 2: Considers some alternatives
- 3: Analyzes multiple alternatives
- 4: Comprehensive alternative analysis

### 7. Quantitative Reasoning (0-4)
- 0: No quantitative reasoning
- 1: Mentions numbers without context
- 2: Basic quantitative reasoning
- 3: Good quantitative analysis
- 4: Sophisticated quantitative reasoning
Note: If question doesn't require quantitative reasoning, score 3-4 if user correctly recognizes this.

### 8. Humility/Uncertainty (0-4)
- 0: Absolute certainty or complete confusion
- 1: Poor calibration (over/under confident)
- 2: Some awareness of uncertainty
- 3: Good calibration
- 4: Excellent calibration with specific caveats

## Scoring Guidelines

1. Score each dimension 0-4 based solely on the rubric
2. Provide 2-4 specific, evidence-based rationale bullets per dimension
3. Quote or reference specific text from answers when possible
4. Calculate overallScore using this formula:
   \`\`\`
   overallScore = (
     clarity * 1.2 +
     relevance * 1.0 +
     logic * 1.5 +
     evidence * 1.3 +
     assumptions * 1.2 +
     alternatives * 1.2 +
     quantitative * 0.8 +
     humility * 1.0
   ) / 9.2 * 25
   \`\`\`
5. Round overallScore to nearest integer

Return ONLY valid JSON matching this schema:

{
  "overallScore": <number 0-100>,
  "dimensions": [
    {
      "name": "clarity",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "relevance",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "logic",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "evidence",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "assumptions",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "alternatives",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "quantitative-reasoning",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    {
      "name": "humility-uncertainty",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    }
  ],
  "feedback": "<optional 1-2 sentence overall feedback>"
}

Return ONLY the JSON output, no additional text.`;
}

/**
 * Invoke Bedrock model
 */
async function invokeBedrock(prompt: string): Promise<string> {
  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    system:
      'You are an expert evaluator of critical thinking skills. Your task is to evaluate user responses against a detailed rubric with 8 dimensions. You must provide structured, objective feedback with specific evidence from the text. Return your evaluation as valid JSON matching the specified schema. Be precise, fair, and constructive.',
  };

  const input: InvokeModelCommandInput = {
    modelId: MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(payload),
  };

  const command = new InvokeModelCommand(input);
  const response = await client.send(command);

  if (!response.body) {
    throw new Error('Empty response from Bedrock');
  }

  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  // Claude response format: { content: [{ text: "..." }] }
  if (responseBody.content && responseBody.content[0]?.text) {
    return responseBody.content[0].text;
  }

  throw new Error('Unexpected Bedrock response format');
}

/**
 * Parse and validate Bedrock response
 */
function parseAndValidateResponse(
  responseText: string
): BedrockEvaluationResponse {
  // Extract JSON from response (in case model adds extra text)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Bedrock response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = BedrockEvaluationResponseSchema.parse(parsed);

  return validated;
}

/**
 * Sleep utility for retries
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
