/**
 * Clarity Infrastructure - CloudWatch Logs
 */

# CloudWatch log group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.environment}-clarity"
  retention_in_days = 7
}
