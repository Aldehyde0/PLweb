import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveSiteOrigin, type HeaderLookup } from '../lib/site-metadata.ts';

const lookupOf = (record: Record<string, string>): HeaderLookup => (name) =>
  record[name.toLowerCase()] ?? null;

void test('SITE_ORIGIN wins over the request host', () => {
  const origin = resolveSiteOrigin(
    lookupOf({ host: 'internal.workers.dev' }),
    'https://learn.example.dev',
  );
  assert.equal(origin?.origin, 'https://learn.example.dev');
});

void test('a bare host in SITE_ORIGIN is treated as https', () => {
  assert.equal(
    resolveSiteOrigin(lookupOf({}), 'learn.example.dev')?.origin,
    'https://learn.example.dev',
  );
  assert.equal(
    resolveSiteOrigin(lookupOf({}), 'http://localhost:3000')?.origin,
    'http://localhost:3000',
  );
});

void test('an unusable SITE_ORIGIN is reported instead of masked by the host', () => {
  assert.equal(
    resolveSiteOrigin(lookupOf({ host: 'fallback.example.com' }), 'http://[bad'),
    null,
  );
});

void test('without SITE_ORIGIN the request host is used', () => {
  const origin = resolveSiteOrigin(
    lookupOf({
      host: 'my-app.some-account.workers.dev',
      'x-forwarded-proto': 'https',
    }),
    undefined,
  );
  assert.equal(origin?.origin, 'https://my-app.some-account.workers.dev');
});

void test('x-forwarded-host wins and a chained value takes the first entry', () => {
  const origin = resolveSiteOrigin(
    lookupOf({
      host: 'internal:8787',
      'x-forwarded-host': 'public.example.com, internal',
      'x-forwarded-proto': 'https, http',
    }),
    undefined,
  );
  assert.equal(origin?.origin, 'https://public.example.com');
});

void test('a local host falls back to http', () => {
  for (const host of ['localhost:8788', '127.0.0.1:8788', '[::1]:8788'])
    assert.equal(
      resolveSiteOrigin(lookupOf({ host }), undefined)?.protocol,
      'http:',
      host,
    );
});

void test('a missing host yields null so metadataBase stays unset', () => {
  assert.equal(resolveSiteOrigin(lookupOf({}), undefined), null);
  assert.equal(resolveSiteOrigin(lookupOf({ host: '  ' }), undefined), null);
});

void test('a malformed forwarded host does not throw', () => {
  assert.equal(
    resolveSiteOrigin(lookupOf({ 'x-forwarded-host': 'not a host' }), undefined),
    null,
  );
});
