/**
 * @concept Git workflow
 * @category Engineering Practices
 * @description Outlines Git version control standards, branch management (GitFlow),
 * conventional commits format (feat:, fix:, refactor:, chore:), and code review pull request standards.
 */

export const gitWorkflowStandards = {
  branchNaming: {
    main: 'Production ready releases',
    develop: 'Integration branch for testing',
    feature: 'feature/vault-item-scan, feature/analytics-dashboard',
    hotfix: 'hotfix/patch-auth-token'
  },
  conventionalCommits: [
    { type: 'feat', description: 'A new user-facing feature' },
    { type: 'fix', description: 'A bug fix' },
    { type: 'refactor', description: 'A code change that neither fixes a bug nor adds a feature' },
    { type: 'docs', description: 'Documentation only changes' },
    { type: 'chore', description: 'Build process or auxiliary tool changes' }
  ],
  pullRequestChecklist: [
    'Automated lint and build verification passing',
    'Feature branch rebased cleanly onto latest develop',
    'Clear PR title and changelog summary provided'
  ]
};
