import assert from 'node:assert/strict';
import test from 'node:test';
import { createLocalId } from '../src/lib/ids.ts';

test('generated identifiers remain inside PostgreSQL INTEGER range', () => {
  const identifiers = Array.from({ length: 5_000 }, createLocalId);
  for (const id of identifiers) {
    assert.ok(Number.isSafeInteger(id));
    assert.ok(id > 0 && id <= 0x7fffffff);
  }
  assert.equal(new Set(identifiers).size, identifiers.length);
});
