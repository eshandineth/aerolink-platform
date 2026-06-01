# DynamoDB Tables — one per microservice (Database-per-Service pattern)

resource "aws_dynamodb_table" "users_table" {
  name         = "${var.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  replica {
    region_name = "us-west-2"
  }
}

resource "aws_dynamodb_table" "flights_table" {
  name         = "${var.project_name}-flights"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "flightId"

  attribute {
    name = "flightId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  replica {
    region_name = "us-west-2"
  }
}

resource "aws_dynamodb_table" "bookings_table" {
  name         = "${var.project_name}-bookings"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "bookingId"

  attribute {
    name = "bookingId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  replica {
    region_name = "us-west-2"
  }
}

resource "aws_dynamodb_table" "baggage_table" {
  name         = "${var.project_name}-baggage"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "baggageId"

  attribute {
    name = "baggageId"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  replica {
    region_name = "us-west-2"
  }
}
