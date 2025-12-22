# Bedrock Evaluation Contract

## Overview

This document specifies the contract between the Clarity API and AWS Bedrock for critical thinking evaluation. All interactions use structured JSON input/output only.

## Model Selection

**Primary Model**: `anthropic.claude-3-sonnet-20240229-v1:0`

**Rationale**:

- Strong reasoning capabilities
- Good instruction-following for structured output
- Cost-effective for evaluation tasks
- Supports long context (200K tokens)

**Fallback**: `anthropic.claude-3-haiku-20240307-v1:0` (for faster/cheaper evaluations)

## Prompt Structure

### System Prompt

```
You are an expert evaluator of critical thinking skills. Your task is to evaluate user responses against a detailed rubric with 8 dimensions. You must provide structured, objective feedback with specific evidence from the text.

Return your evaluation as valid JSON matching the specified schema. Be precise, fair, and constructive.
```

### User Prompt Template

```
# Scenario
{{scenarioDescription}}

# Questions and Answers
{{#each questions}}
## Question {{questionId}}: {{questionText}}

**User's Answer:**
{{answer}}

**Focus Areas for This Question:** {{focusAreas}}
{{/each}}

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

## Output Format

Return ONLY valid JSON matching this schema:

{
  "overallScore": <number 0-100>,
  "dimensions": [
    {
      "name": "clarity",
      "score": <0-4>,
      "rationale": ["<specific observation>", "<specific observation>"]
    },
    // ... repeat for all 8 dimensions
  ],
  "feedback": "<optional 1-2 sentence overall feedback>"
}

## Scoring Guidelines

1. Score each dimension 0-4 based solely on the rubric
2. Provide 2-4 specific, evidence-based rationale bullets per dimension
3. Quote or reference specific text from answers when possible
4. Calculate overallScore using this formula:
```

overallScore = (
clarity _ 1.2 +
relevance _ 1.0 +
logic _ 1.5 +
evidence _ 1.3 +
assumptions _ 1.2 +
alternatives _ 1.2 +
quantitative _ 0.8 +
humility _ 1.0
) / 9.2 \* 25

```
5. Round overallScore to nearest integer

Return ONLY the JSON output, no additional text.
```

## Request Format

```typescript
{
  scenarioId: string;
  scenarioDescription: string;
  questions: Array<{
    questionId: string;
    questionText: string;
    answer: string;
    focusAreas: string[]; // Subset of rubric dimensions
  }>;
}
```

## Response Format

```typescript
{
  overallScore: number; // 0-100
  dimensions: Array<{
    name: string; // One of 8 rubric dimensions
    score: number; // 0-4
    rationale: string[]; // 2-4 specific observations
  }>;
  feedback?: string; // Optional overall feedback (1-2 sentences)
}
```

## Example Request

```json
{
  "scenarioId": "scenario-001",
  "scenarioDescription": "You're an investor considering a $2M Series A investment in a healthcare AI startup. The founders claim their model can diagnose rare diseases with 95% accuracy based on a study of 1,000 patients.",
  "questions": [
    {
      "questionId": "q1",
      "questionText": "What are the key assumptions underlying the founders' accuracy claim?",
      "answer": "The main assumption is that the 95% accuracy on 1,000 patients will generalize to real-world use. This assumes the test set was representative, that rare diseases were actually rare in the sample (which raises questions about statistical power), and that the model won't face different patient populations or data quality in production. They're also assuming 95% accuracy is clinically meaningful without specifying false positive vs false negative rates.",
      "focusAreas": ["assumptions", "quantitative-reasoning"]
    }
  ]
}
```

## Example Response

```json
{
  "overallScore": 82,
  "dimensions": [
    {
      "name": "clarity",
      "score": 4,
      "rationale": [
        "Clear identification of main assumption upfront",
        "Well-structured argument with distinct points",
        "Precise terminology (e.g., 'statistical power', 'false positive/negative')"
      ]
    },
    {
      "name": "relevance",
      "score": 4,
      "rationale": [
        "Directly addresses question about assumptions",
        "All points relate to the accuracy claim",
        "No tangential information"
      ]
    },
    {
      "name": "logic",
      "score": 3,
      "rationale": [
        "Sound reasoning about generalization",
        "Valid connection between sample size and rare diseases",
        "Minor: could strengthen link between representativeness and accuracy"
      ]
    },
    {
      "name": "evidence",
      "score": 3,
      "rationale": [
        "References specific numbers from scenario (1,000 patients, 95%)",
        "Mentions statistical concepts (power, FP/FN rates)",
        "Could provide examples or benchmarks for comparison"
      ]
    },
    {
      "name": "assumptions",
      "score": 4,
      "rationale": [
        "Explicitly identifies multiple key assumptions",
        "Tests assumptions (representativeness, generalization)",
        "Questions hidden assumptions (clinical meaningfulness)"
      ]
    },
    {
      "name": "alternatives",
      "score": 2,
      "rationale": [
        "Hints at alternatives (different populations, data quality)",
        "Doesn't fully explore alternative explanations for reported accuracy",
        "Could consider confounding factors or selection bias"
      ]
    },
    {
      "name": "quantitative-reasoning",
      "score": 4,
      "rationale": [
        "Recognizes statistical power issues with rare diseases",
        "Distinguishes FP vs FN rates (not just overall accuracy)",
        "Questions whether sample size sufficient for rare events"
      ]
    },
    {
      "name": "humility-uncertainty",
      "score": 3,
      "rationale": [
        "Appropriately questions rather than asserts",
        "Acknowledges gaps (FP/FN rates not specified)",
        "Could be more explicit about confidence levels"
      ]
    }
  ],
  "feedback": "Strong analysis of assumptions with good quantitative reasoning. Consider exploring alternative explanations for the reported accuracy and being more explicit about confidence in conclusions."
}
```

## Error Handling

### Invalid Response Format

If Bedrock returns invalid JSON or missing required fields:

1. Log the raw response
2. Retry up to 2 times with more explicit format instructions
3. If still invalid, return error to user with fallback message

### Validation Rules

After parsing JSON response, validate:

- ✅ `overallScore` is number 0-100
- ✅ `dimensions` array has exactly 8 elements
- ✅ Each dimension has valid `name` (one of 8 rubric dimensions)
- ✅ Each dimension `score` is integer 0-4
- ✅ Each dimension `rationale` has 1-5 strings
- ✅ `feedback` is string or undefined

Use Zod schema `BedrockEvaluationResponseSchema` for validation.

## Retry Strategy

```typescript
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

async function evaluateWithRetry(request) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await invokeBedrock(request);
      return BedrockEvaluationResponseSchema.parse(response);
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}
```

## Cost Estimation

**Claude 3 Sonnet Pricing (Dec 2024)**:

- Input: $3 per 1M tokens
- Output: $15 per 1M tokens

**Typical Evaluation**:

- Scenario + questions + rubric: ~2,000 input tokens
- User answers: ~500 tokens
- Evaluation output: ~1,500 tokens

**Cost per evaluation**: ~$0.03

**Monthly cost (1000 users, 10 attempts each)**: ~$300

## Performance Targets

- **Latency**: < 5 seconds p95
- **Availability**: 99.9%
- **Token limit**: 8,000 input tokens (scenario + answers)

## Monitoring

Log for each Bedrock invocation:

- Request ID
- Model ID
- Input token count
- Output token count
- Latency (ms)
- Success/failure
- Validation errors (if any)
