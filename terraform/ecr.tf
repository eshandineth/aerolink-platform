locals {
  services = [
    "auth-service",
    "flight-service",
    "booking-service",
    "baggage-service",
    "websocket-service"
  ]
}

resource "aws_ecr_repository" "aerolink_repos" {
  for_each = toset(local.services)
  name     = "aerolink/${each.key}"

  image_scanning_configuration {
    scan_on_push = true
  }
}
