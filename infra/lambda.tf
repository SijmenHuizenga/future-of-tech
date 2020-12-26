
data "archive_file" "lamda_prediction" {
  type        = "zip"
  source_file = "${path.module}/../lambda/prediction.js"
  output_path = "tmp/upload.zip"
}

resource "aws_lambda_function" "prediction" {
  filename         = "tmp/upload.zip"
  function_name    = "NewPrediction"
  handler          = "prediction.handler"
  role             = aws_iam_role.lamda_prediction.arn
  source_code_hash = data.archive_file.lamda_prediction.output_base64sha256
  publish          = true
  runtime          = "nodejs12.x"
  environment {
    variables = {
      RECAPCHA_SERVER_TOKEN = ''
    }
  }
}

resource "aws_iam_role" "lamda_prediction" {
  name = "new_prediction_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# allow apigateway access to the lambda
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.prediction.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.future.execution_arn}/*/*"
}

###########
# DynamoDB Role
###########
data "aws_iam_policy_document" "lambda_dynamodb" {
  statement {
    effect = "Allow"

    actions = [
      "dynamodb:PutItem",
      "logs:PutLogEvents",
    ]

    resources = [aws_dynamodb_table.prediction.arn]
  }
}

resource "aws_iam_policy" "lambda_dynamodb" {
  name   = "predictions-dynamodb"
  policy = data.aws_iam_policy_document.lambda_dynamodb.json
}

resource "aws_iam_policy_attachment" "lambda_dynamodb" {
  name       = "predictions-dynamodb"
  roles      = [aws_iam_role.lamda_prediction.name]
  policy_arn = aws_iam_policy.lambda_dynamodb.arn
}

###########
# IAM role
###########

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.prediction.function_name}"
  retention_in_days = 30
}

data "aws_iam_policy_document" "lambda_logs" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = flatten([for _, v in ["%v:*", "%v:*:*"] : format(v, aws_cloudwatch_log_group.lambda_logs.arn)])
  }
}

resource "aws_iam_policy" "lambda_logs" {
  name   = "predictions-logs"
  policy = data.aws_iam_policy_document.lambda_logs.json
}

resource "aws_iam_policy_attachment" "lambda_logs" {
  name       = "predictions-logs"
  roles      = [aws_iam_role.lamda_prediction.name]
  policy_arn = aws_iam_policy.lambda_logs.arn
}