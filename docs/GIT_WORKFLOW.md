# Git Workflow & Engineering Standards

## 1. Branch Strategy
- `main`: Production release branch. All commits here are tagged with semantic version numbers (e.g. `v1.2.0`).
- `develop`: Primary integration branch. Features and hotfixes are merged here for automated verification.
- `feature/*`: Short-lived branches created for isolated feature development (e.g. `feature/item-vision-scan`).
- `refactor/*`: Code improvement branches that restructure existing code without changing functionality.
- `hotfix/*`: Direct patches branched from `main` to address critical production issues.

## 2. Commit Message Conventions (Conventional Commits)
Format: `<type>(<optional scope>): <subject>`

- `feat`: A new user-facing capability or API endpoint
- `fix`: Bug fix in client or server logic
- `refactor`: Structural improvement without changing behavior
- `docs`: Updates to documentation, README, or markdown checklists
- `test`: Unit, integration, or E2E tests
- `chore`: Dependency updates, tooling, and build configuration

### Examples from Recent PRs:
```bash
feat: Add keyboard navigation and accessibility to AutocompleteInput
refactor: Optimize Navbar performance with React hooks
feat: Add loading states and error handling to ItemCard
```

## 3. Pull Request Protocol
1. Create a new branch from `main` for your feature/fix.
2. Make focused, atomic commits with clear messages.
3. Rebase feature branch onto latest `main` or `develop`.
4. Run linter and automated build checks (`npm run lint` and `npm run build`).
5. Ensure no API keys or environment secrets are committed.
6. Push branch to remote repository.
7. Open PR with clear description, screenshots, and checklist references.

### PR Description Template:
```markdown
## Changes
- List of specific changes made
- Use checkboxes for multiple items

## Why
Brief explanation of the problem being solved or feature being added

## Testing
- How to test the changes
- Edge cases covered
- Accessibility considerations (if applicable)
```

## 4. Recent Pull Requests (Examples)

### PR #1: Keyboard Navigation & Accessibility for AutocompleteInput
**Branch:** `feature/autocomplete-accessibility`  
**Type:** Feature Enhancement

**Changes:**
- ✨ Added arrow key navigation (ArrowUp/ArrowDown) for suggestion list
- ⌨️ Enter key to select highlighted suggestion  
- 🚪 Escape key to close dropdown
- ♿ Implemented ARIA attributes for screen reader support (role, aria-expanded, aria-activedescendant)
- 🎨 Visual highlight for keyboard-focused items
- 🔧 Added ref to input for better focus management

**Why:** Improves accessibility for keyboard users and screen reader users, making the autocomplete component WCAG 2.1 compliant.

**Testing:**
- Navigate suggestions with arrow keys
- Select with Enter, close with Escape
- Test with screen readers (NVDA, JAWS)

---

### PR #2: Performance Optimization for Navbar Component
**Branch:** `refactor/navbar-performance`  
**Type:** Refactoring

**Changes:**
- ⚡ Used `useCallback` for event handlers to prevent unnecessary re-renders
- 🧮 Used `useMemo` for unreadCount calculation
- 🔄 Extracted inline arrow functions to named callbacks
- 📦 Fixed dependency arrays in useEffect hooks
- 🚀 Reduced component re-render frequency

**Why:** Improve React component performance by memoizing functions and values, reducing unnecessary re-renders when parent components update.

**Testing:**
- Verify all interactive features work (search, notifications, theme toggle, user menu)
- Use React DevTools Profiler to confirm reduced render count
- Check notification polling still works every 30 seconds

---

### PR #3: Loading States & Error Handling for ItemCard
**Branch:** `feat/itemcard-improvements`  
**Type:** Feature Enhancement

**Changes:**
- 💫 Added image loading skeleton with pulse animation
- 🖼️ Implemented image error handling with automatic fallback to placeholder
- 🗑️ Loading state for delete operations with disabled button
- 🛡️ Prevented multiple simultaneous delete operations
- ✨ Smooth transitions between loading and loaded image states
- 🎯 Visual feedback during async operations (pulse animation)

**Why:** Enhance user experience by providing visual feedback during asynchronous operations and gracefully handling image loading failures.

**Testing:**
- Test with slow network conditions to see loading skeleton
- Test with broken image URLs to verify fallback
- Verify delete button disables during deletion
- Check animations are smooth and non-janky

---

## 5. Best Practices Applied

### Accessibility
- Always include ARIA attributes for interactive components
- Support keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Test with screen readers
- Ensure proper focus management

### Performance
- Use `useCallback` for function props passed to child components
- Use `useMemo` for expensive calculations
- Avoid inline arrow functions in JSX when passing to children
- Include proper dependency arrays in hooks

### User Experience
- Show loading states for async operations
- Handle errors gracefully with fallbacks
- Provide visual feedback for user actions
- Use smooth animations and transitions

### Code Quality
- Write atomic, focused commits
- Keep PRs small and reviewable
- Add descriptive comments for complex logic
- Follow consistent naming conventions
