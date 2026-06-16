output "public_ip" {
  description = "Public IP of the demo VM."
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "Base URL of the deployed demo."
  value       = "http://${aws_eip.app.public_ip}"
}

output "ssh_command" {
  description = "SSH command to access the VM."
  value       = "ssh ${var.instance_user}@${aws_eip.app.public_ip}"
}
