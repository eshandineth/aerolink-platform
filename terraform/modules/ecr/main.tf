# ECR Repositories — one per microservice for Docker image storage

resource "aws_ecr_repository" "repos" {
  for_each     = toset(var.microservices)
  name         = "${var.project_name}/${each.key}"
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
