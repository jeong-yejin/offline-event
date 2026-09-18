import fs from 'node:fs';
import path from 'node:path';

// Read-only inventory. Asset paths inside the embedded public/reboundx build are not TS modules.
const root = process.cwd();
function walkFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(name) : /(?<!\.d)\.tsx?$/.test(name) ? [name] : [];
  });
}
const sources = walkFiles(path.join(root, 'src'));
const graph = new Map();
const relative = name => path.relative(root, name);
const isTest = name => /\.test\.tsx?$/.test(name);
for (const source of sources) {
  const imports = new Set();
  // This project uses relative literal imports only. Computed dynamic paths require manual review.
  const code = fs.readFileSync(source, 'utf8');
  const specifiers = code.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"]([^'"]+)['"]/g);
  for (const [, specifier] of specifiers) {
    if (!specifier.startsWith('.')) continue;
    const base = path.resolve(path.dirname(source), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find(name => sources.includes(name));
    if (resolved) imports.add(resolved);
  }
  graph.set(source, [...imports]);
}
function reachable(entries) {
  const seen = new Set();
  function walk(name) {
    if (seen.has(name)) return;
    seen.add(name);
    for (const dependency of graph.get(name) ?? []) walk(dependency);
  }
  entries.forEach(walk);
  return seen;
}
const runtime = reachable([path.join(root, 'src/main.tsx')]);
const tests = reachable(sources.filter(isTest));
const files = sources.map(fileName => ({
  file: relative(fileName),
  status: runtime.has(fileName) ? 'runtime' : isTest(fileName) ? 'test' : tests.has(fileName) ? 'test-only' : 'unreachable',
  imports: (graph.get(fileName) ?? []).map(relative).sort(),
})).sort((a, b) => a.file.localeCompare(b.file));
const unused = files.filter(file => file.status === 'unreachable');
const report = { files, unreachable: unused.map(file => file.file),
  limitations: ['Static TypeScript import graph only; includes type imports.', 'No deletion decisions for generated bundles, CSS selectors, dynamic asset strings, or externally invoked scripts.'] };
if (process.argv.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else {
  for (const file of files) process.stdout.write(`${file.status.padEnd(12)} ${file.file}\n`);
  process.stdout.write(`\n${files.length} source files; ${unused.length} unreachable modules.\n`);
}
if (unused.length) process.exitCode = 1;
