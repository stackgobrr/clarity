/**
 * Clarity Infrastructure - AWS Provider Configuration
 */

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "clarity"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
