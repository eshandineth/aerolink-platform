output "eks_cluster_endpoint" {
  description = "EKS Cluster API endpoint"
  value       = module.compute.cluster_endpoint
}

output "eks_cluster_name" {
  description = "EKS Cluster name"
  value       = module.compute.cluster_name
}

output "ecr_repository_urls" {
  description = "ECR repository URLs for each microservice"
  value       = module.ecr.repository_urls
}

output "frontend_website_url" {
  description = "S3 static website URL for the frontend"
  value       = module.frontend.website_url
}

output "eventbridge_bus_name" {
  description = "EventBridge event bus name"
  value       = module.messaging.event_bus_name
}

output "github_actions_role_arn" {
  description = "IAM Role ARN for GitHub Actions OIDC"
  value       = module.oidc.github_actions_role_arn
}
