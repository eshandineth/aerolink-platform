resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "aerolink-system-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", "app/aerolink-ingress/xxxxxx"]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "API Requests (ALB)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "aerolink-flights"],
            [".", "ConsumedWriteCapacityUnits", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1"
          title   = "DynamoDB Capacity"
        }
      }
    ]
  })
}
