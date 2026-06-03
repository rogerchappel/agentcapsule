import test from 'node:test';
import assert from 'node:assert/strict';
import { version, isUnsafeEntryPath, safeJoin } from '../src/index.js';

test('version is valid semver', () => {
  assert.equal(typeof version, 'string');
  assert.match(version, /^\d+\.\d+\.\d+$/);
});

test('isUnsafeEntryPath blocks root paths', () => {
  assert.equal(isUnsafeEntryPath('/etc/passwd'), true);
});

test('isUnsafeEntryPath blocks traversal', () => {
  assert.equal(isUnsafeEntryPath('../../../etc/passwd'), true);
});

test('isUnsafeEntryPath allows safe names', () => {
  assert.equal(isUnsafeEntryPath('readme.txt'), false);
});

test('safeJoin stays within base', () => {
  const base = '/tmp/capsule';
  const result = safeJoin(base, 'file.txt');
  assert.ok(result.startsWith(base));
});
