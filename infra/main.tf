variable "region" {
  default = "us-east-1"
}

variable "domain_name" {
  default = "future-of.technology"
}

terraform {
  backend "s3" {
    bucket = "tfstate-future-of-tech"
    key    = "deployment.tfstate"
    region = "us-east-1"
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.region
}