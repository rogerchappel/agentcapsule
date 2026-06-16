import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const packageJsonUrl = new URL('../../package.json', import.meta.url);
const cliPath = new URL('../src/bin.js', import.meta.url);

describe('agentcapsule', () => {
  it('package.json should have all required metadata', () => {
    const pkg = JSON.parse(readFileSync(packageJsonUrl, 'utf8'));
    assert.ok(pkg.name, 'name required');
    assert.ok(pkg.version, 'version required');
    assert.ok(pkg.author && pkg.author !== 'StackForge User', 'author must not be StackForge User');
    assert.ok(pkg.repository, 'repository required');
    assert.ok(pkg.bugs, 'bugs required');
    assert.ok(pkg.homepage, 'homepage required');
    assert.ok(pkg.scripts, 'scripts required');
    assert.ok(pkg.scripts.test, 'test script required');
    assert.ok(pkg.scripts.build, 'build script required');
    assert.ok(pkg.scripts['release:check'], 'release:check required');
  });

  it('compiled CLI can initialize, pack, inspect, and unpack a capsule', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'agentcapsule-'));
    const out = path.join(root, 'out');
    writeFileSync(path.join(root, 'README.md'), '# Fixture\n', 'utf8');

    execFileSync(process.execPath, [cliPath.pathname, 'init', '--root', root], { encoding: 'utf8' });
    const packOutput = execFileSync(process.execPath, [cliPath.pathname, 'pack', '--root', root, '--note', 'release smoke'], { encoding: 'utf8' });
    assert.match(packOutput, /Packed 2 file\(s\)/);

    const archivePath = path.join(root, '.agentcapsule', 'handoff.tar.gz');
    const inspectOutput = execFileSync(process.execPath, [cliPath.pathname, 'inspect', archivePath], { encoding: 'utf8' });
    const manifest = JSON.parse(inspectOutput);
    assert.equal(manifest.capsuleName, 'handoff');
    assert.ok(manifest.files.some((file: { path: string }) => file.path === 'README.md'));

    const unpackOutput = execFileSync(process.execPath, [cliPath.pathname, 'unpack', archivePath, '--out', out], { encoding: 'utf8' });
    assert.match(unpackOutput, /Unpacked/);
    assert.equal(readFileSync(path.join(out, 'README.md'), 'utf8'), '# Fixture\n');
  });
});
