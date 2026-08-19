import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readWorkflow = (name: string) => readFileSync(`.github/workflows/${name}`, 'utf8');

describe('GitHub Actions safety contracts', () => {
  it('keeps checkpoint releases manual and dry-run by default', () => {
    const release = readWorkflow('release.yml');

    expect(release).toContain('workflow_dispatch:');
    expect(release).not.toMatch(/^\s{2}(push|pull_request|schedule):/m);
    expect(release).toMatch(/dry_run:[\s\S]*?default: true/);
    expect(release).toContain('does not match package.json');
    expect(release).toContain('Tag already exists');
    expect(release).toMatch(/if: \$\{\{ !inputs\.dry_run \}\}/);
  });

  it('mirrors the stable local command surface in CI', () => {
    const ci = readWorkflow('ci.yml');

    for (const command of [
      'pnpm check',
      'pnpm typecheck',
      'pnpm test',
      'pnpm test:sim',
      'pnpm build',
      'pnpm build:storybook',
      'pnpm wiki:check',
      'pnpm test:e2e',
    ]) {
      expect(ci).toContain(command);
    }
    expect(ci).toContain('actions/upload-artifact@v7');
  });
});
