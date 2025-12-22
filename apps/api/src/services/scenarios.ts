/**
 * Scenarios service
 * For MVP: Returns hardcoded scenario. In production, this would query DynamoDB.
 */
import { type Scenario } from '../models/index.js';

// MVP: Hardcoded scenario for testing
const MOCK_SCENARIO: Scenario = {
  scenarioId: 'single-use-plastics-ban',
  title: 'Single-Use Plastics Ban',
  description:
    'A city government is considering a total ban on single-use plastics (bags, straws, utensils, containers) within city limits. The ban would affect all businesses and consumers. Proponents argue it will reduce pollution and environmental harm. Critics say it will hurt businesses and may not have the intended environmental benefits.',
  difficulty: 'intermediate',
  tags: ['environment', 'policy', 'economics'],
  questions: [
    {
      questionId: 'q1',
      text: 'What are the strongest arguments both for and against this ban?',
      type: 'long',
      targetWordCount: 300,
      focusAreas: ['logic', 'alternatives', 'evidence'],
    },
    {
      questionId: 'q2',
      text: 'What key assumptions underlie the arguments on each side, and how would you test them?',
      type: 'long',
      targetWordCount: 250,
      focusAreas: ['assumptions', 'evidence', 'quantitative-reasoning'],
    },
    {
      questionId: 'q3',
      text: 'If you had to make the final decision, what would you decide and why?',
      type: 'long',
      targetWordCount: 200,
      focusAreas: ['clarity', 'humility-uncertainty', 'alternatives'],
    },
  ],
  active: true,
  createdAt: '2024-01-01T00:00:00Z',
  estimatedMinutes: 45,
};

/**
 * Lists all available scenarios
 * MVP: Returns hardcoded scenario
 */
export async function listScenarios(): Promise<Scenario[]> {
  // MVP: Return single hardcoded scenario
  return [MOCK_SCENARIO];
}

/**
 * Retrieves a scenario by ID
 * MVP: Returns hardcoded scenario if ID matches
 */
export async function getScenario(
  scenarioId: string
): Promise<Scenario | null> {
  // MVP: Return mock scenario if ID matches
  if (scenarioId === MOCK_SCENARIO.scenarioId) {
    return MOCK_SCENARIO;
  }
  return null;
}
