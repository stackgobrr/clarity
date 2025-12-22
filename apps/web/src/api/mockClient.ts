/**
 * Mock API client for local development
 * Returns hardcoded responses to test the UI without backend
 */

export interface Scenario {
  scenarioId: string;
  title: string;
  description: string;
  questions: Array<{
    questionId: string;
    text: string;
    type: 'short' | 'long';
  }>;
}

export interface DimensionScore {
  name: string;
  score: number;
  rationale: string[];
}

export interface EvaluationResult {
  attemptId: string;
  overallScore: number;
  dimensions: DimensionScore[];
  feedback?: string;
}

// Hardcoded test scenario
const MOCK_SCENARIO: Scenario = {
  scenarioId: 'mvp-test',
  title: 'Single-Use Plastics Ban',
  description:
    "You're advising a city council on whether to ban single-use plastics. Supporters claim it will reduce ocean pollution by 30%. Critics say it will hurt small businesses and cost jobs.",
  questions: [
    {
      questionId: 'q1',
      text: "What are the key assumptions in the supporters' 30% pollution reduction claim?",
      type: 'long',
    },
    {
      questionId: 'q2',
      text: 'What evidence would you need to evaluate the economic impact on small businesses?',
      type: 'long',
    },
    {
      questionId: 'q3',
      text: 'What would change your mind about this policy?',
      type: 'short',
    },
  ],
};

// Mock evaluation response
const MOCK_EVALUATION: Omit<EvaluationResult, 'attemptId'> = {
  overallScore: 78,
  dimensions: [
    {
      name: 'clarity',
      score: 3,
      rationale: [
        'Clear thesis statement',
        'Most terms well-defined',
        'Minor ambiguity in conclusion',
      ],
    },
    {
      name: 'relevance',
      score: 4,
      rationale: [
        'Directly addresses all questions',
        'No tangential information',
        'Stays focused throughout',
      ],
    },
    {
      name: 'logic',
      score: 3,
      rationale: [
        'Sound reasoning overall',
        'Valid inferences from premises',
        'One minor logical gap in economic argument',
      ],
    },
    {
      name: 'evidence',
      score: 2,
      rationale: [
        'Provides some examples',
        'Could cite more specific data',
        'Relies partially on general knowledge',
      ],
    },
    {
      name: 'assumptions',
      score: 4,
      rationale: [
        'Explicitly identifies key assumptions',
        'Tests validity of pollution reduction claim',
        'Questions hidden assumptions about business impact',
      ],
    },
    {
      name: 'alternatives',
      score: 3,
      rationale: [
        'Considers alternative policies',
        'Explores counterarguments',
        'Could expand on tradeoffs more',
      ],
    },
    {
      name: 'quantitative-reasoning',
      score: 2,
      rationale: [
        'Mentions 30% reduction figure',
        'Questions statistical validity',
        'Could provide more numerical analysis',
      ],
    },
    {
      name: 'humility-uncertainty',
      score: 3,
      rationale: [
        'Acknowledges gaps in knowledge',
        'Appropriately hedges conclusions',
        'Could be more explicit about confidence levels',
      ],
    },
  ],
  feedback:
    'Strong analysis of assumptions with good logical structure. Consider adding more specific evidence and quantitative analysis to strengthen arguments.',
};

/**
 * Get the test scenario
 */
export async function getScenario(): Promise<Scenario> {
  // Simulate network delay
  await delay(300);
  return MOCK_SCENARIO;
}

/**
 * Submit an attempt (mocked)
 */
export async function submitAttempt(
  _answers: Array<{ questionId: string; answer: string }>
): Promise<EvaluationResult> {
  // Simulate network delay for evaluation
  await delay(2000);

  return {
    attemptId: generateId(),
    ...MOCK_EVALUATION,
  };
}

/**
 * Get evaluation results (mocked)
 */
export async function getResults(attemptId: string): Promise<EvaluationResult> {
  await delay(500);

  return {
    attemptId,
    ...MOCK_EVALUATION,
  };
}

// Utilities
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateId(): string {
  return `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
