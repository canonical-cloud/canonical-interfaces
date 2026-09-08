import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (relative) => JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
const legacy = read('../route-maps/legacy/api.route-map.json');
const typed = read('../route-maps/api.route-map.json');
const pathShape = (value) => value.replace(/\{[^}]+\}/g, '{}');

test('typed migration preserves every published v1 operation and HTTP method', () => {
  assert.equal(legacy.schema_version, '1.0.0');
  assert.equal(typed.schema_version, '2.0.0');
  for (const [key, value] of Object.entries(legacy.map)) {
    const original = typeof value === 'string' ? { path: value, methods: ['GET'] } : value;
    const migrated = typed.map[key];
    assert.ok(migrated, `missing published operation ${key}`);
    assert.equal(pathShape(migrated.path), pathShape(original.path), key);
    for (const method of original.methods ?? ['GET']) {
      assert.ok(migrated.methods.includes(method), `${key} lost ${method}`);
    }
  }
});

test('v2 quote aliases preserve typed request, response and query contracts', () => {
  for (const operation of ['list_quotes', 'create_quote', 'get_quote', 'retry_quote', 'quote_events']) {
    const route = typed.map[operation];
    const alias = typed.map[`${operation}_alias`];
    assert.equal(alias.path, route.path.replace('/api/v1/', '/v1/'));
    assert.deepEqual(alias.methods, route.methods);
    assert.deepEqual(alias.request, route.request);
    assert.deepEqual(alias.response, route.response);
    assert.deepEqual(Object.keys(alias.query_params ?? {}), Object.keys(route.query_params ?? {}));
  }
});

test('unmodeled readiness and sync bodies do not generate misleading typed clients', () => {
  for (const [key, route] of Object.entries(typed.map)) {
    if (key.includes('readiness') || key.startsWith('sync_')) {
      assert.equal(route.client, false, key);
    }
  }
});
