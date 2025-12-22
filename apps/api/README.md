# API Lambda Handlers

This directory contains AWS Lambda handlers for the Clarity API, organized by domain concern.

## Structure

```
src/
├── handlers/          # Lambda entry points (one per API route/trigger)
│   ├── attempts/      # Attempt-related endpoints
│   │   ├── submit.ts  # POST /attempts - Submit new attempt
│   │   ├── get.ts     # GET /attempts/{id} - Get attempt by ID
│   │   └── list.ts    # GET /attempts - List user attempts
│   ├── profiles/      # Profile-related endpoints
│   │   ├── get.ts     # GET /users/{userId}/profile - Get user profile
│   │   └── update.ts  # DynamoDB Stream trigger - Update profile after attempt
│   └── scenarios/     # Scenario-related endpoints
│       ├── list.ts    # GET /scenarios - List available scenarios
│       └── get.ts     # GET /scenarios/{id} - Get scenario by ID
├── services/          # Business logic layer
│   ├── bedrock.ts     # Bedrock evaluation service
│   ├── attempts.ts    # Attempt data access
│   ├── profiles.ts    # Profile calculation and data access
│   └── scenarios.ts   # Scenario data access
├── models/            # Shared types and Zod schemas
│   └── index.ts       # Type definitions and validation schemas
└── utils/             # Shared utilities
    └── api.ts         # API helpers (responses, auth parsing, etc.)
```

## Architecture Principles

### Separation of Concerns

- **Handlers**: Thin entry points that handle HTTP/event parsing, authorization checks, and response formatting
- **Services**: Business logic and external service integration (Bedrock, DynamoDB)
- **Models**: Type definitions and runtime validation (Zod schemas)
- **Utils**: Cross-cutting concerns (logging, error handling, auth)

### Lambda Deployment

Each handler is deployed as a separate Lambda function for:

- Independent scaling
- Clear CloudWatch metrics per endpoint
- Granular IAM permissions
- Faster cold starts (smaller bundles)

### Error Handling

All handlers should:

1. Catch and log errors
2. Return appropriate HTTP status codes
3. Never expose internal details in error messages
4. Use structured logging for debugging

### Authentication

- API Gateway uses Cognito User Pool authorizer
- User identity available in `event.requestContext.authorizer`
- Use `getUserFromToken()` utility to parse user info

## Development

### Adding a New Handler

1. Create handler file in appropriate domain folder
2. Export `handler` function with correct AWS type (`APIGatewayProxyHandler`, `DynamoDBStreamHandler`, etc.)
3. Add Terraform resource in `/infra/terraform` to deploy the Lambda
4. Wire up API Gateway route (if HTTP endpoint)

### Testing

```bash
# Run type check
npm run type-check

# Run linting
npm run lint

# Run unit tests (TODO: work item 06)
npm test
```

## Dependencies

Install AWS SDK dependencies when implementing services:

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/client-bedrock-runtime
npm install @aws-sdk/lib-dynamodb  # DynamoDB Document Client
```

## Next Steps

See `work-items/02-backend-api-and-bedrock.md` for implementation tasks.
