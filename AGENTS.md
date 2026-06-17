# AGENTS.md

## Repository Role

- This repository is integrated with a centralized Jenkins platform.
- Jenkins controller configuration lives in the separate `automation-platform` repository.
- This repository still owns its own pipeline, infrastructure, and deployment rules.

## Required Ownership Boundaries

- Keep the repository pipeline in [`Jenkinsfile`](C:/Users/Jona/Documents/FinanzasClaras/Jenkinsfile:1).
- Keep repository infrastructure in [`infra/terraform`](C:/Users/Jona/Documents/FinanzasClaras/infra/terraform).
- Keep repository environment examples in versioned example files only.
- Do not move this repository deployment logic into centralized Jenkins unless it becomes genuinely cross-repository behavior.

## Jenkins Integration

- The pipeline entrypoint is `Jenkinsfile` at repository root.
- Jenkins credentials must use repository-prefixed IDs.
- Production deploy must be explicitly gated.
- This repository should be onboarded in Jenkins as a multibranch pipeline under `applications/finanzasclaras`.

## Terraform Rules

- Terraform for this repository lives under `infra/terraform`.
- Backend keys must be unique per environment.
- State must not be shared with other repositories.
- Apply should only run for approved target branches or manual release flows.

## Secrets

- Secrets never live in Git.
- Use Jenkins credentials or an external secret manager.
- If the pipeline needs a `.env` file, inject it through a secret file credential.

## Environment Mapping

- `develop` -> `demo`
- `staging` -> `staging`
- `main` -> `production`

If the branch strategy changes, update this file and the `Jenkinsfile` together.

## Required Credential Inventory

- `finanzasclaras-repo-git-ssh`
- `finanzasclaras-demo-aws-access-key-id`
- `finanzasclaras-demo-aws-secret-access-key`
- `finanzasclaras-demo-vm-public-key`
- `finanzasclaras-demo-vm-ssh`
- `finanzasclaras-demo-env-file`
- `finanzasclaras-demo-admin-name`
- `finanzasclaras-demo-admin-email`
- `finanzasclaras-demo-admin-password`
- `finanzasclaras-demo-tf-backend`
- `finanzasclaras-staging-aws-access-key-id`
- `finanzasclaras-staging-aws-secret-access-key`
- `finanzasclaras-staging-vm-public-key`
- `finanzasclaras-staging-vm-ssh`
- `finanzasclaras-staging-env-file`
- `finanzasclaras-staging-admin-name`
- `finanzasclaras-staging-admin-email`
- `finanzasclaras-staging-admin-password`
- `finanzasclaras-staging-tf-backend`
- `finanzasclaras-production-aws-access-key-id`
- `finanzasclaras-production-aws-secret-access-key`
- `finanzasclaras-production-vm-public-key`
- `finanzasclaras-production-vm-ssh`
- `finanzasclaras-production-env-file`
- `finanzasclaras-production-admin-name`
- `finanzasclaras-production-admin-email`
- `finanzasclaras-production-admin-password`
- `finanzasclaras-production-tf-backend`

## Safe Change Rules

- Do not change centralized Jenkins plugins from this repository.
- Do not change another repository deployment logic from this repository.
- Do not restore local Jenkins helper files in this repo.
- Document rollback expectations before enabling production deploys.
