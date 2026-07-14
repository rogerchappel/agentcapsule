import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateManifest } from '../src/check.js';

const packageJsonUrl = new URL('../../package.json', import.meta.url);
const cliPath = new URL('../src/bin.js', import.meta.url);
const fixtureUrl = new URL('../../fixtures/handoff/', import.meta.url);

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
    cpSync(fixtureUrl, root, { recursive: true });

    execFileSync(process.execPath, [cliPath.pathname, 'init', '--root', root], { encoding: 'utf8' });
    writeFileSync(path.join(root, '.env'), 'TOKEN=secret\n', 'utf8');
    const planOutput = execFileSync(process.execPath, [cliPath.pathname, 'plan', '--root', root], { encoding: 'utf8' });
    const plan = JSON.parse(planOutput);
    assert.equal(plan.capsuleName, 'handoff');
    assert.ok(plan.skipped.some((file: { path: string }) => file.path === '.env'));
    assert.ok(plan.warnings.includes('secret-like files were skipped by the default denylist'));

    const packOutput = execFileSync(process.execPath, [cliPath.pathname, 'pack', '--root', root, '--note', 'release smoke'], { encoding: 'utf8' });
    assert.match(packOutput, /Packed 2 file\(s\)/);

    const archivePath = path.join(root, '.agentcapsule', 'handoff.tar.gz');
    const checkOutput = execFileSync(process.execPath, [cliPath.pathname, 'check', archivePath], { encoding: 'utf8' });
    assert.equal(JSON.parse(checkOutput).ok, true);

    const inspectOutput = execFileSync(process.execPath, [cliPath.pathname, 'inspect', archivePath], { encoding: 'utf8' });
    const manifest = JSON.parse(inspectOutput);
    assert.equal(manifest.capsuleName, 'handoff');
    assert.ok(manifest.files.some((file: { path: string }) => file.path === 'README.md'));

    const unpackOutput = execFileSync(process.execPath, [cliPath.pathname, 'unpack', archivePath, '--out', out], { encoding: 'utf8' });
    assert.match(unpackOutput, /Unpacked/);
    assert.match(readFileSync(path.join(out, 'README.md'), 'utf8'), /Handoff Fixture/);
  });

  it('reports manifest validation findings deterministically', () => {
    const findings = validateManifest({
      schemaVersion: 1,
      capsuleName: 'broken',
      createdAt: '2026-06-29T00:00:00.000Z',
      root: '/tmp/project',
      configPath: '/tmp/project/agentcapsule.config.json',
      notes: [],
      files: [
        { path: 'README.md', size: 3, sha256: 'bad' },
        { path: '../escape.txt', size: 2, sha256: '0'.repeat(64) }
      ],
      skipped: [],
      commands: [{ name: 'test', command: 'npm test', exitCode: 1, stdout: '', stderr: 'failed', durationMs: 5 }],
      totals: { fileCount: 1, includedBytes: 10, skippedCount: 0 }
    });

    assert.deepEqual(findings, [
      'command receipt failed: test exitCode=1',
      'file count mismatch: totals=1 files=2',
      'included byte mismatch: totals=10 files=5',
      'invalid sha256 for README.md',
      'unsafe file path: ../escape.txt'
    ]);
  });
});
