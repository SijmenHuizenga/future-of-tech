resource "aws_api_gateway_rest_api" "future" {
  name        = "FutureApi"
  description = "What's in the future? We will know in 10 years"
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.future.id
  parent_id   = aws_api_gateway_rest_api.future.root_resource_id
  path_part   = "api"
}

resource "aws_api_gateway_method" "prediction" {
  rest_api_id   = aws_api_gateway_rest_api.future.id
  resource_id   = aws_api_gateway_resource.proxy.id

  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_root" {
  rest_api_id = aws_api_gateway_rest_api.future.id
  resource_id = aws_api_gateway_resource.proxy.id
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

resource "aws_api_gateway_account" "demo" {
  cloudwatch_role_arn = aws_iam_role.api_gateway_loggin.arn
}

resource "aws_iam_role" "api_gateway_loggin" {
  name = "api_gateway_loggin"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "apigateway.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "api_gateway_loggin-pushcloudwatchlogs" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
  role = aws_iam_role.api_gateway_loggin.name
}