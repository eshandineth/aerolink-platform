output "event_bus_name" {
  value = aws_cloudwatch_event_bus.aerolink_event_bus.name
}

output "notification_queue_arn" {
  value = aws_sqs_queue.notification_queue.arn
}

output "notification_queue_url" {
  value = aws_sqs_queue.notification_queue.id
}
