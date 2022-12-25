terraform {
  backend "s3" {
    bucket  = "chattyapp-terraform-state"
    key     = "develop/chatapp.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "JasNagra"
  }
}
