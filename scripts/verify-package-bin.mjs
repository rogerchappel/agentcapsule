import { access } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const bins = Object.entries(pkg.bin ?? {});

if (bins.length === 0) {
  throw new Error('package.json does not declare any CLI bin entries');
}

const missing = [];
for (const [name, target] of bins) {
  try {
    await access(new URL(`../${target}`, import.meta.url));
  } catch {
    missing.push(`${name} -> ${target}`);
  }
}

if (missing.length > 0) {
  throw new Error(`package bin target(s) missing after build: ${missing.join(', ')}`);
}

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], { encoding: 'utf8' });
const [pack] = JSON.parse(packOutput);
const leakedTests = pack.files
  .map(file => file.path)
  .filter(path => path.startsWith('dist/test/'));

if (leakedTests.length > 0) {
  throw new Error(`package includes compiled test files: ${leakedTests.join(', ')}`);
}

console.log(`Verified ${bins.length} package bin target(s).`);
