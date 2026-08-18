# Git Workflow & Engineering Standards

## 1. Branch Strategy
- `main`: Production release branch. All commits here are tagged with semantic version numbers (e.g. `v1.2.0`).
- `develop`: Primary integration branch. Features and hotfixes are merged here for automated verification.
- `feature/*`: Short-lived branches created for isolated feature development (e.g. `feature/item-vision-scan`).
- `hotfix/*`: Direct patches branched from `main` to address critical production issues.

## 2. Commit Message Conventions (Conventional Commits)
Format: `<type>(<optional scope>): <subject>`

- `feat`: A new user-facing capability or API endpoint
- `fix`: Bug fix in client or server logic
- `refactor`: Structural improvement without changing behavior
- `docs`: Updates to documentation, README, or markdown checklists
- `test`: Unit, integration, or E2E tests
- `chore`: Dependency updates, tooling, and build configuration

## 3. Pull Request Protocol
1. Rebase feature branch onto latest `develop`.
2. Run linter and automated build checks (`npm run lint` and `npm run build`).
3. Ensure no API keys or environment secrets are committed.
4. Open PR with clear description, screenshots, and checklist references.
