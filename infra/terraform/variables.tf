variable "aws_region" {
  description = "AWS region for the demo environment."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in resource tags."
  type        = string
  default     = "finanzas-claras"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "demo"
}

variable "instance_type" {
  description = "EC2 instance type."
  type        = string
  default     = "t3.small"
}

variable "instance_user" {
  description = "SSH user for the EC2 image."
  type        = string
  default     = "ubuntu"
}

variable "app_directory" {
  description = "Deployment directory on the VM."
  type        = string
  default     = "/opt/finanzas-claras"
}

variable "public_key" {
  description = "SSH public key content used by Jenkins to access the demo VM."
  type        = string
  sensitive   = true
}

variable "ssh_ingress_cidrs" {
  description = "CIDR blocks allowed to connect to SSH."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
