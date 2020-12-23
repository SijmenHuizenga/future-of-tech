resource "aws_api_gateway_rest_api" "future" {
  name        = "FutureApi"
  description = "What's in the future? We will know in 10 years"
}

resource "aws_api_gateway_method" "prediction" {
  rest_api_id   = aws_api_gateway_rest_api.future.id
  resource_id   = aws_api_gateway_rest_api.future.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.future.id
  resource_id = aws_api_gateway_method.prediction.resource_id
  http_method = aws_api_gateway_method.prediction.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.prediction.invoke_arn
}

resource "aws_api_gateway_deployment" "prod" {
  depends_on = [
    aws_api_gateway_integration.lambda_root,
  ]

  rest_api_id = aws_api_gateway_rest_api.future.id
  stage_name  = "prod"
}