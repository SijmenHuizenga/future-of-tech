
data "archive_file" "lamda_prediction" {
  type        = "zip"
  source_file = "${path.module}/../lambda/prediction.js"
  output_path = "tmp/upload.zip"
}

resource "aws_lambda_function" "prediction" {
  filename         = "tmp/upload.zip"
  function_name    = "NewPrediction"
  handler          = "prediction.handler"
  role          = aws_iam_role.lamda_prediction.arn

  source_code_hash = data.archive_file.lamda_prediction.output_base64sha256

  runtime = "nodejs12.x"
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

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.prediction.function_name
  principal     = "apigateway.amazonaws.com"

  # The "/*/*" portion grants access from any method on any resource
  # within the API Gateway REST API.
  source_arn = "${aws_api_gateway_rest_api.future.execution_arn}/*/*"
}