import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readWorkflow = (name: string) => readFileSync(`.github/workflows/${name}`, 'utf8');

describe('GitHub Actions safety contracts', () => {
  it('keeps Wave 2 gate claims atomic across repository entry points', () => {
    const claims = [
      /WAVE 2 OPEN/.test(readFileSync('README.md', 'utf8')),
      /WAVE 2 OPEN/.test(readFileSync('wiki-site/index.md', 'utf8')),
      /WAVE 2 OPEN/.test(readFileSync('logs/STATUS.md', 'utf8')),
      /WAVE 2 OPEN/.test(readFileSync('work-packets/INDEX.md', 'utf8')),
    ];
    expect(new Set(claims).size).toBe(1);
  });

  it('keeps checkpoint releases manual and dry-run by default', () => {
    const release = readWorkflow('release.yml');

    expect(release).toContain('workflow_dispatch:');
    expect(release).not.toMatch(/^\s{2}(push|pull_request|schedule):/m);
    expect(release).toMatch(/dry_run:[\s\S]*?default: true/);
    expect(release).toContain('does not match package.json');
    expect(release).toContain('Tag already exists');
    expect(release).toMatch(/release-notes\/\$\{RELEASE_VERSION\}\.md/);
    expect(release).toMatch(/petty-lord-storybook-\$\{RELEASE_VERSION\}\.tar\.gz/);
    expect(release).toContain('pnpm test:release-smoke');
    expect(release).toContain(
      'pnpm exec playwright test --config tests/ui/foundation/playwright.config.ts',
    );
    expect(release).toContain('--notes-file release-artifacts/release-notes.md');
    expect(release).toContain('gh release download');
    expect(release).toContain('sha256sum -c checksums.sha256');
    expect(release).toMatch(/git rev-parse "\$\{RELEASE_VERSION\}\^\{\}"/);
    expect(release).not.toContain('--generate-notes');
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
