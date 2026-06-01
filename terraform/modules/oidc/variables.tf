variable "project_name" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "ecr_repo_arns" {
  type = list(string)
}

variable "frontend_bucket_arn" {
  type = string
}
