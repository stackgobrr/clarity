/**
 * Clarity Infrastructure - DynamoDB Tables
 */

# DynamoDB table for attempts
resource "aws_dynamodb_table" "attempts" {
  name         = "${var.environment}-clarity-attempts"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "attemptId"

  attribute {
    name = "attemptId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  # GSI for querying user's attempts by timestamp
  global_secondary_index {
    name            = "userId-timestamp-index"
    hash_key        = "userId"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  tags = {
    Name = "${var.environment}-clarity-attempts"
  }
}
