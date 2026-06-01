module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-eks-cluster"
  cluster_version = var.cluster_version

  cluster_endpoint_public_access = true

  vpc_id                   = var.vpc_id
  subnet_ids               = var.private_subnets
  control_plane_subnet_ids = var.intra_subnets

  eks_managed_node_group_defaults = {
    instance_types = ["t3.micro"]
  }

  eks_managed_node_groups = {
    aerolink_nodes = {
      min_size       = 1
      max_size       = 10
      desired_size   = 8
      instance_types = ["t3.micro"]

      iam_role_additional_policies = {
        DynamoDBAccess    = "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
        EventBridgeAccess = "arn:aws:iam::aws:policy/AmazonEventBridgeFullAccess"
      }
    }
  }

  enable_cluster_creator_admin_permissions = true
}
