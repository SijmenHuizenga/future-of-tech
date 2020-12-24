resource "aws_dynamodb_table" "prediction" {
  name         = "Predictions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "UUID"

  attribute {
    name = "UUID"
    type = "S"
  }

  point_in_time_recovery {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}