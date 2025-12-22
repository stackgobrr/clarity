/**
 * Clarity Infrastructure - IAM Roles and Policies
 */

# Lambda execution role
resource "aws_iam_role" "lambda_execution" {
  name = "${var.environment}-clarity-lambda-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda DynamoDB policy
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.environment}-clarity-lambda-dynamodb"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.attempts.arn,
          "${aws_dynamodb_table.attempts.arn}/index/*"
        ]
      }
    ]
  })
}

# Lambda Bedrock policy
resource "aws_iam_role_policy" "lambda_bedrock" {
  name = "${var.environment}-clarity-lambda-bedrock"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "bedrock:InvokeModel"
        ]
        Resource = "arn:aws:bedrock:${var.aws_region}::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
      }
    ]
  })
}
