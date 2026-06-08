import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const packageJsonUrl = new URL('../package.json', import.meta.url);

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
});
