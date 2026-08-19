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

const importSpecifiers = (file: string): string[] => {
  const source = text(file);
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  return patterns.flatMap((pattern) =>
    [...source.matchAll(pattern)].map((match) => match[1] ?? ''),
  );
};

const resolveSourceImport = (from: string, specifier: string): string | null => {
  const aliases: Record<string, string> = {
    '@app/': 'app/',
    '@assets/': 'assets/',
    '@content/': 'content/',
    '@contracts/': 'contracts/',
    '@sim/': 'sim/',
    '@ui/': 'ui/',
  };
  const alias = Object.entries(aliases).find(([prefix]) => specifier.startsWith(prefix));
  const base = specifier.startsWith('.')
    ? path.resolve(path.dirname(from), specifier)
    : alias
      ? path.resolve(sourceRoot, alias[1], specifier.slice(alias[0].length))
      : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
};

const transitiveSourceDependencies = (roots: readonly string[]): string[] => {
  const visited = new Set<string>();
  const queue = [...roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;
    visited.add(current);
    for (const specifier of importSpecifiers(current)) {
      const resolved = resolveSourceImport(current, specifier);
      if (resolved && !visited.has(resolved)) queue.push(resolved);
    }
  }
  return [...visited];
};

describe('integrated architecture boundaries', () => {
  it('keeps simulation free of browser, UI, app, content and asset dependencies', () => {
    const simFiles = importsFrom('sim');
    const dependencies = transitiveSourceDependencies(simFiles);
    expect(
      dependencies.filter((file) =>
        /[\\/](app|assets|content|ui)[\\/]/.test(path.relative(sourceRoot, file)),
      ),
    ).toEqual([]);
    const browserOrNondeterminism =
      /\b(Math\.random|Date\.now|window|document|localStorage|sessionStorage|indexedDB|fetch|XMLHttpRequest|WebSocket|setTimeout|setInterval|requestAnimationFrame|performance\.now|crypto\.getRandomValues)\b/;
    expect(simFiles.filter((file) => browserOrNondeterminism.test(text(file)))).toEqual([]);
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
      'src/contracts/domains.ts',
      'src/contracts/ids.ts',
      'src/contracts/projection.ts',
      'src/contracts/simulation.ts',
      'src/contracts/state.ts',
    ]) {
      expect(existsSync(entry), entry).toBe(true);
    }
    const narrowConsumers = filesUnder(path.resolve('tests/unit/wave2-consumers')).filter((file) =>
      file.endsWith('.ts'),
    );
    expect(narrowConsumers).toHaveLength(4);
    expect(
      narrowConsumers.filter((file) => importSpecifiers(file).includes('@contracts/index')),
    ).toEqual([]);
  });
});
