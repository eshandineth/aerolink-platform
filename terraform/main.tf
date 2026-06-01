module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  aws_region   = var.aws_region
}

module "compute" {
  source          = "./modules/compute"
  project_name    = var.project_name
  cluster_version = var.cluster_version
  vpc_id          = module.networking.vpc_id
  private_subnets = module.networking.private_subnets
  intra_subnets   = module.networking.intra_subnets
}

module "database" {
  source       = "./modules/database"
  project_name = var.project_name
}

module "ecr" {
  source        = "./modules/ecr"
  project_name  = var.project_name
  microservices = var.microservices
}

module "messaging" {
  source       = "./modules/messaging"
  project_name = var.project_name
}

module "lambda" {
  source                 = "./modules/lambda"
  project_name           = var.project_name
  notification_queue_arn = module.messaging.notification_queue_arn
}

module "frontend" {
  source       = "./modules/frontend"
  project_name = var.project_name
}

module "monitoring" {
  source       = "./modules/monitoring"
  project_name = var.project_name
}

module "oidc" {
  source              = "./modules/oidc"
  project_name        = var.project_name
  github_repo         = var.github_repo
  aws_region          = var.aws_region
  ecr_repo_arns       = module.ecr.repository_arns
  frontend_bucket_arn = module.frontend.bucket_arn
}
