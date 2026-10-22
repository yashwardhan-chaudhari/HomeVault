# Contributing to HomeVault

Thank you for your interest in contributing to HomeVault! We appreciate contributions that improve security, reliability, documentation, and user experience.

## Development Workflow

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/yashwardhan-chaudhari/HomeVault.git
   cd HomeVault
   ```

2. **Branching**:
   Create a focused feature or bugfix branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Environment Setup**:
   Copy `.env.example` to `.env` and configure `JWT_SECRET`:
   ```bash
   cp .env.example .env
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **Run Automated Tests**:
   Ensure all automated tests pass before submitting your PR:
   ```bash
   npm test
   ```

7. **Build Validation**:
   Confirm that the production build completes without warnings or errors:
   ```bash
   npm run build
   ```

## Commit Guidelines

We follow Conventional Commits:
- `feat:` A new user-facing feature
- `fix:` A bug fix
- `test:` Adding or updating tests
- `docs:` Documentation changes
- `chore:` Maintenance, dependency updates, or configuration

## Submitting Pull Requests

1. Open a pull request against `main`.
2. Provide a clear description of the problem solved, changes made, and testing steps.
3. Ensure CI checks pass.
