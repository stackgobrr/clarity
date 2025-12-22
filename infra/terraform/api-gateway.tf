/**
 * Clarity Infrastructure - API Gateway
 */

# API Gateway REST API
resource "aws_api_gateway_rest_api" "clarity" {
  name        = "${var.environment}-clarity-api"
  description = "Clarity API - Critical thinking evaluation platform"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# API Gateway resources and methods
module "api_gateway" {
  source = "github.com/h3ow3d/h3ow3d-infra-api-gateway?ref=v1.0.0"

  api_id            = aws_api_gateway_rest_api.clarity.id
  root_resource_id  = aws_api_gateway_rest_api.clarity.root_resource_id
  api_execution_arn = aws_api_gateway_rest_api.clarity.execution_arn

  routes = {
    submit_attempt = {
      path        = "/attempts"
      http_method = "POST"
      lambda_arn  = aws_lambda_function.submit_attempt.arn
      lambda_name = aws_lambda_function.submit_attempt.function_name
    }

    list_attempts = {
      path        = "/attempts"
      http_method = "GET"
      lambda_arn  = aws_lambda_function.list_attempts.arn
      lambda_name = aws_lambda_function.list_attempts.function_name
    }

    get_attempt = {
      path        = "/attempts/{id}"
      http_method = "GET"
      lambda_arn  = aws_lambda_function.get_attempt.arn
      lambda_name = aws_lambda_function.get_attempt.function_name
      request_params = {
        "method.request.path.id" = true
      }
    }

    list_scenarios = {
      path        = "/scenarios"
      http_method = "GET"
      lambda_arn  = aws_lambda_function.list_scenarios.arn
      lambda_name = aws_lambda_function.list_scenarios.function_name
    }

    get_scenario = {
      path        = "/scenarios/{id}"
      http_method = "GET"
      lambda_arn  = aws_lambda_function.get_scenario.arn
      lambda_name = aws_lambda_function.get_scenario.function_name
      request_params = {
        "method.request.path.id" = true
      }
    }
  }

  # CORS enabled for frontend access
  cors_configuration = {
    enabled = true
  }
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "clarity" {
  rest_api_id = aws_api_gateway_rest_api.clarity.id

  depends_on = [module.api_gateway]

  lifecycle {
    create_before_destroy = true
  }

  triggers = {
    redeployment = sha1(jsonencode([
      module.api_gateway,
      aws_lambda_function.submit_attempt.source_code_hash,
      aws_lambda_function.get_attempt.source_code_hash,
      aws_lambda_function.list_attempts.source_code_hash,
      aws_lambda_function.list_scenarios.source_code_hash,
      aws_lambda_function.get_scenario.source_code_hash,
    ]))
  }
}

# API Gateway stage
resource "aws_api_gateway_stage" "clarity" {
  deployment_id = aws_api_gateway_deployment.clarity.id
  rest_api_id   = aws_api_gateway_rest_api.clarity.id
  stage_name    = var.environment

  xray_tracing_enabled = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }
}
