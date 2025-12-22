# DynamoDB Schema Design

## Table Design Philosophy

- Single-table design per entity type for simplicity in MVP
- Partition key enables direct lookups and query patterns
- GSIs for alternate access patterns
- Sort keys for time-based queries and versioning

## Table 1: Attempts

**Purpose**: Store all user attempts with evaluations

### Primary Key

- **Partition Key (PK)**: `attemptId` (UUID)
- **Sort Key (SK)**: Not used (single item per attempt)

### Attributes

| Attribute       | Type              | Description                                      |
| --------------- | ----------------- | ------------------------------------------------ |
| attemptId       | String (UUID)     | Unique attempt identifier                        |
| userId          | String            | Cognito user ID                                  |
| scenarioId      | String            | Reference to scenario                            |
| timestamp       | String (ISO 8601) | When attempt was submitted                       |
| answers         | List              | User's answers (see structure below)             |
| evaluation      | Map               | Bedrock evaluation results (see structure below) |
| durationSeconds | Number            | Time spent on attempt                            |
| status          | String            | "completed" \| "in-progress" \| "abandoned"      |

### Answer Structure

```json
{
  "questionId": "string",
  "questionText": "string",
  "answer": "string",
  "wordCount": 123
}
```

### Evaluation Structure

```json
{
  "overallScore": 75,
  "dimensions": [
    {
      "name": "clarity",
      "score": 3,
      "rationale": [
        "Clear thesis statement in opening",
        "Key terms well-defined",
        "Minor ambiguity in conclusion"
      ]
    }
  ],
  "feedback": "Overall strong analysis...",
  "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
  "evaluatedAt": "2025-12-22T10:30:00Z"
}
```

### Global Secondary Indexes

#### GSI1: UserAttempts

- **Partition Key**: `userId`
- **Sort Key**: `timestamp` (descending)
- **Purpose**: List all attempts for a user, newest first
- **Projection**: ALL

### Access Patterns

1. Get attempt by ID: `GetItem(attemptId)`
2. List user attempts: `Query(GSI1, userId, timestamp DESC)`
3. Get recent attempts for profile: `Query(GSI1, userId, limit=10)`

### Example Item

```json
{
  "attemptId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "us-east-1:12345678-1234-1234-1234-123456789012",
  "scenarioId": "scenario-001",
  "timestamp": "2025-12-22T10:30:00.000Z",
  "durationSeconds": 1800,
  "status": "completed",
  "answers": [
    {
      "questionId": "q1",
      "questionText": "What are the key assumptions in this argument?",
      "answer": "The argument assumes that correlation implies causation...",
      "wordCount": 45
    }
  ],
  "evaluation": {
    "overallScore": 78,
    "dimensions": [
      {
        "name": "clarity",
        "score": 3,
        "rationale": ["Clear thesis statement", "Key terms well-defined"]
      },
      {
        "name": "assumptions",
        "score": 4,
        "rationale": [
          "Explicitly identifies hidden assumptions",
          "Tests validity of assumptions"
        ]
      }
    ],
    "feedback": "Strong identification of assumptions. Consider exploring alternative explanations.",
    "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
    "evaluatedAt": "2025-12-22T10:35:00.000Z"
  }
}
```

---

## Table 2: Profiles

**Purpose**: Store user profile snapshots over time

### Primary Key

- **Partition Key (PK)**: `userId` (Cognito user ID)
- **Sort Key (SK)**: `timestamp` (ISO 8601, descending)

### Attributes

| Attribute       | Type              | Description                   |
| --------------- | ----------------- | ----------------------------- |
| userId          | String            | Cognito user ID               |
| timestamp       | String (ISO 8601) | When snapshot was created     |
| attemptCount    | Number            | Total attempts by user        |
| dimensions      | List              | Per-dimension statistics      |
| weaknesses      | List              | Bottom 3 dimensions           |
| improvements    | List              | Most improved dimensions      |
| recommendations | List              | Suggested exercises           |
| overallAverage  | Number            | Average overall score (0-100) |

### Dimension Statistics Structure

```json
{
  "name": "clarity",
  "movingAverage": 2.8,
  "standardDeviation": 0.6,
  "trend": "improving",
  "recentScores": [2, 3, 3, 3, 2]
}
```

### Access Patterns

1. Get latest profile: `Query(userId, timestamp DESC, limit=1)`
2. Get profile history: `Query(userId, timestamp DESC)`
3. Update profile: `PutItem` (triggered by DynamoDB Stream on Attempts)

### Example Item

```json
{
  "userId": "us-east-1:12345678-1234-1234-1234-123456789012",
  "timestamp": "2025-12-22T10:35:00.000Z",
  "attemptCount": 15,
  "overallAverage": 76.5,
  "dimensions": [
    {
      "name": "clarity",
      "movingAverage": 3.2,
      "standardDeviation": 0.5,
      "trend": "stable",
      "recentScores": [3, 3, 4, 3, 3, 3, 3, 3, 4, 3]
    },
    {
      "name": "logic",
      "movingAverage": 3.5,
      "standardDeviation": 0.4,
      "trend": "improving",
      "recentScores": [3, 3, 3, 3, 4, 3, 4, 4, 4, 3]
    },
    {
      "name": "assumptions",
      "movingAverage": 1.8,
      "standardDeviation": 0.7,
      "trend": "declining",
      "recentScores": [2, 2, 1, 2, 2, 1, 2, 2, 1, 2]
    }
  ],
  "weaknesses": [
    {
      "dimension": "assumptions",
      "score": 1.8,
      "gap": -1.4
    },
    {
      "dimension": "quantitative-reasoning",
      "score": 2.1,
      "gap": -1.1
    }
  ],
  "improvements": [
    {
      "dimension": "logic",
      "improvement": 0.8,
      "from": 2.7,
      "to": 3.5
    }
  ],
  "recommendations": [
    "Practice identifying hidden assumptions in arguments",
    "Try Fermi estimation exercises to improve quantitative reasoning",
    "Review assumption-testing frameworks"
  ]
}
```

---

## Table 3: Scenarios

**Purpose**: Store scenario sets with questions

### Primary Key

- **Partition Key (PK)**: `scenarioId` (String)
- **Sort Key (SK)**: Not used

### Attributes

| Attribute        | Type              | Description                                |
| ---------------- | ----------------- | ------------------------------------------ |
| scenarioId       | String            | Unique scenario identifier                 |
| title            | String            | Scenario title                             |
| description      | String            | Scenario context/prompt                    |
| difficulty       | String            | "beginner" \| "intermediate" \| "advanced" |
| tags             | Set               | Tags for categorization                    |
| questions        | List              | Questions for this scenario                |
| active           | Boolean           | Whether scenario is available              |
| createdAt        | String (ISO 8601) | When scenario was created                  |
| estimatedMinutes | Number            | Expected time to complete                  |

### Question Structure

```json
{
  "questionId": "string",
  "text": "string",
  "type": "short" | "long",
  "targetWordCount": 100,
  "focusAreas": ["assumptions", "evidence"]
}
```

### Global Secondary Indexes

#### GSI1: ActiveScenarios

- **Partition Key**: `active` (Boolean)
- **Sort Key**: `difficulty`
- **Purpose**: List all active scenarios by difficulty
- **Projection**: ALL

### Access Patterns

1. Get scenario by ID: `GetItem(scenarioId)`
2. List active scenarios: `Query(GSI1, active=true)`
3. List scenarios by difficulty: `Query(GSI1, active=true, difficulty="beginner")`

### Example Item

```json
{
  "scenarioId": "scenario-001",
  "title": "Tech Startup Investment Decision",
  "description": "You're an investor considering a $2M Series A investment in a healthcare AI startup. The founders claim their model can diagnose rare diseases with 95% accuracy...",
  "difficulty": "intermediate",
  "tags": ["business", "healthcare", "statistics"],
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "estimatedMinutes": 30,
  "questions": [
    {
      "questionId": "q1",
      "text": "What are the key assumptions underlying the founders' accuracy claim?",
      "type": "long",
      "targetWordCount": 200,
      "focusAreas": ["assumptions", "quantitative-reasoning"]
    },
    {
      "questionId": "q2",
      "text": "What alternative explanations could account for the reported accuracy?",
      "type": "long",
      "targetWordCount": 150,
      "focusAreas": ["alternatives", "evidence"]
    },
    {
      "questionId": "q3",
      "text": "What additional information would you need to make this decision?",
      "type": "short",
      "targetWordCount": 100,
      "focusAreas": ["clarity", "relevance"]
    }
  ]
}
```

---

## Capacity Planning

### Initial Provisioning (MVP)

- **Attempts**: On-demand (bursty write pattern)
- **Profiles**: On-demand (infrequent updates)
- **Scenarios**: Provisioned 5 RCU / 1 WCU (read-heavy, rarely updated)

### Estimated Costs (1000 users, 10 attempts/user/month)

- Attempts: ~10,000 writes/month + reads
- Profiles: ~10,000 stream triggers/month
- Scenarios: Minimal (mostly cached in app)

Total: <$10/month for DynamoDB

---

## DynamoDB Streams

### Attempts Table Stream

- **Enabled**: Yes
- **View Type**: NEW_IMAGE
- **Purpose**: Trigger profile update Lambda when new attempt is created
- **Consumer**: `handlers/profiles/update.ts`

### Processing Flow

1. User submits attempt → Write to Attempts table
2. DynamoDB Stream triggers profile update Lambda
3. Lambda fetches recent attempts, calculates moving averages
4. Lambda writes new Profile snapshot

---

## Migration Strategy

### Initial Data Seeding

1. Create 10-20 seed scenarios covering various topics
2. Load via script or Terraform provisioning
3. No user data initially (users create attempts organically)

### Schema Versioning

Add `schemaVersion` attribute to all tables for future migrations:

```json
{
  "schemaVersion": "1.0"
}
```
