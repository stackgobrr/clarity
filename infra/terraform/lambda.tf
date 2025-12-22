/**
 * Clarity Infrastructure - Lambda Functions
 */

# Build Lambda deployment package
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../apps/api/dist"
  output_path = "${path.module}/lambda-deployment.zip"
}

# Lambda function for submitting attempts
resource "aws_lambda_function" "submit_attempt" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-clarity-submit-attempt"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "handlers/attempts/submit.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 60
  memory_size      = 512

  environment {
    variables = {
      ATTEMPTS_TABLE_NAME = aws_dynamodb_table.attempts.name
      BEDROCK_MODEL_ID    = "anthropic.claude-3-sonnet-20240229-v1:0"
    }
  }
}

# Lambda function for getting attempt
resource "aws_lambda_function" "get_attempt" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-clarity-get-attempt"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "handlers/attempts/get.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256

  environment {
    variables = {
      ATTEMPTS_TABLE_NAME = aws_dynamodb_table.attempts.name
    }
  }
}

# Lambda function for listing attempts
resource "aws_lambda_function" "list_attempts" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-clarity-list-attempts"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "handlers/attempts/list.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256

  environment {
    variables = {
      ATTEMPTS_TABLE_NAME = aws_dynamodb_table.attempts.name
    }
  }
}

# Lambda function for listing scenarios
resource "aws_lambda_function" "list_scenarios" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-clarity-list-scenarios"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "handlers/scenarios/list.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 5
  memory_size      = 256
}

# Lambda function for getting scenario
resource "aws_lambda_function" "get_scenario" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.environment}-clarity-get-scenario"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "handlers/scenarios/get.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"
  timeout          = 5
  memory_size      = 256
}
