terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1" # Can be overridden
}

# DynamoDB Base Tables
resource "aws_dynamodb_table" "users_table" {
  name           = "aerolink-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "flights_table" {
  name           = "aerolink-flights"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "flightId"

  attribute {
    name = "flightId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "bookings_table" {
  name           = "aerolink-bookings"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "bookingId"

  attribute {
    name = "bookingId"
    type = "S"
  }
}

resource "aws_dynamodb_table" "baggage_table" {
  name           = "aerolink-baggage"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "baggageId"

  attribute {
    name = "baggageId"
    type = "S"
  }
}

# EventBridge Bus
resource "aws_cloudwatch_event_bus" "aerolink_event_bus" {
  name = "aerolink-events"
}

# S3 Bucket for Frontend (Static Website Hosting)
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "aerolink-frontend-app-bucket-unique-123" # Must be globally unique, change if needed
}

resource "aws_s3_bucket_website_configuration" "frontend_website" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend_bucket_pab" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.frontend_bucket_pab]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      },
    ]
  })
}
