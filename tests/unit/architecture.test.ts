import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const sourceRoot = path.resolve('src');
const publicRoot = path.resolve('public');

function filesUnder(root: string): string[] {
  return readdirSync(root).flatMap((entry) => {
    const candidate = path.join(root, entry);
    return statSync(candidate).isDirectory() ? filesUnder(candidate) : [candidate];
  });
}

const sourceFiles = filesUnder(sourceRoot).filter((file) => /\.(ts|tsx)$/.test(file));
const importsFrom = (rootSegment: string): string[] =>
  sourceFiles.filter((file) => file.includes(`${path.sep}${rootSegment}${path.sep}`));
const text = (file: string): string => readFileSync(file, 'utf8');

describe('integrated architecture boundaries', () => {
  it('keeps simulation free of browser, UI, app, content and asset dependencies', () => {
    const forbidden =
      /from\s+['"][^'"]*(react|zustand|@ui|@app|@content|@assets|\/ui\/|\/app\/|\/content\/|\/assets\/)|\b(Math\.random|Date\.now|setTimeout|requestAnimationFrame|performance\.now)\b/;
    expect(importsFrom('sim').filter((file) => forbidden.test(text(file)))).toEqual([]);
  });

  it('keeps authored content declarative and independent from behavior/presentation', () => {
    const forbidden =
      /from\s+['"][^'"]*(react|zustand|@ui|@app|@sim|@assets|\/ui\/|\/app\/|\/sim\/|\/assets\/)/;
    expect(importsFrom('content').filter((file) => forbidden.test(text(file)))).toEqual([]);
  });

  it('keeps production UI on projections rather than raw simulation state', () => {
    const forbidden = /from\s+['"][^'"]*(@sim|\/sim\/)/;
    expect(importsFrom('ui').filter((file) => forbidden.test(text(file)))).toEqual([]);
  });

  it('rejects authored SVG, icon fonts and prohibited vector icon packages', () => {
    const authoredFiles = [...filesUnder(sourceRoot), ...filesUnder(publicRoot)];
    expect(authoredFiles.filter((file) => path.extname(file).toLowerCase() === '.svg')).toEqual([]);

    const jsxText = sourceFiles
      .filter((file) => file.endsWith('.tsx') && !file.endsWith('.test.tsx'))
      .map(text)
      .join('\n');
    expect(jsxText).not.toMatch(/<svg\b/i);
    const productionText = sourceFiles
      .filter((file) => !file.endsWith('.test.ts'))
      .map(text)
      .join('\n');
    expect(productionText).not.toMatch(/from\s+['"][^'"]*\.svg(?:\?[^'"]*)?['"]/i);
    expect(productionText).not.toMatch(
      /from\s+['"][^'"]*(lucide|heroicons|radix-icons|fontawesome|tabler|phosphor|iconify)/i,
    );
  });

  it('keeps the frozen contract entry points available to Wave 2 consumers', () => {
    for (const entry of [
      'src/contracts/assets.ts',
      'src/contracts/content.ts',
      'src/contracts/ids.ts',
      'src/contracts/projection.ts',
      'src/contracts/simulation.ts',
      'src/contracts/state.ts',
    ]) {
      expect(existsSync(entry), entry).toBe(true);
    }
  });
});
