# EventBridge Bus
resource "aws_cloudwatch_event_bus" "aerolink_event_bus" {
  name = "${var.project_name}-events"
}

# SQS Dead Letter Queue
resource "aws_sqs_queue" "notification_dlq" {
  name = "${var.project_name}-notification-dlq"
}

# Main SQS Queue for Notifications
resource "aws_sqs_queue" "notification_queue" {
  name = "${var.project_name}-notification-queue"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_dlq.arn
    maxReceiveCount     = 3
  })
}

# EventBridge Rule to route events to SQS
resource "aws_cloudwatch_event_rule" "notification_rule" {
  name           = "${var.project_name}-notification-rule"
  event_bus_name = aws_cloudwatch_event_bus.aerolink_event_bus.name

  event_pattern = jsonencode({
    "source": [
      "aerolink.booking-service",
      "aerolink.flight-service",
      "aerolink.baggage-service"
    ]
  })
}

# EventBridge Target (SQS)
resource "aws_cloudwatch_event_target" "sqs_target" {
  rule           = aws_cloudwatch_event_rule.notification_rule.name
  event_bus_name = aws_cloudwatch_event_bus.aerolink_event_bus.name
  target_id      = "SendToSQS"
  arn            = aws_sqs_queue.notification_queue.arn
}

# SQS Policy allowing EventBridge to send messages
resource "aws_sqs_queue_policy" "notification_queue_policy" {
  queue_url = aws_sqs_queue.notification_queue.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.notification_queue.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn": aws_cloudwatch_event_rule.notification_rule.arn
          }
        }
      }
    ]
  })
}
