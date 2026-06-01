variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "aerolink"
}

variable "cluster_version" {
  description = "Kubernetes version for EKS"
  type        = string
  default     = "1.30"
}

variable "microservices" {
  description = "List of microservices to create ECR repos for"
  type        = list(string)
  default     = ["auth-service", "flight-service", "booking-service", "baggage-service", "websocket-service"]
}

variable "github_repo" {
  description = "GitHub repository in format owner/repo for OIDC"
  type        = string
  default     = "eshandineth/aerolink-platform"
}
