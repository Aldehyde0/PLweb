import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RscRequestTracker,
  isVerifiedNavigationCancellation,
  type NetworkEvent,
  type NetworkFailure,
} from '../scripts/browser-network.ts';

const start = (
  id: string,
  url = 'http://localhost/exercises?q=NumPy&_rsc=test',
) => ({
  method: 'Network.requestWillBeSent',
  params: { requestId: id, request: { url } },
});
void test('RSC requests stay pending through response headers until their bodies finish', () => {
  const tracker = new RscRequestTracker();
  tracker.record(start('rsc'));
  tracker.record({
    method: 'Network.responseReceived',
    params: { requestId: 'rsc', response: { status: 200 } },
  });
  assert.equal(tracker.pending.size, 1);
  tracker.record({
    method: 'Network.loadingFinished',
    params: { requestId: 'rsc' },
  });
  assert.equal(tracker.pending.size, 0);
  assert.deepEqual(tracker.failures, []);
});
void test('overlapping RSC requests settle independently and stalled requests remain pending', () => {
  const tracker = new RscRequestTracker();
  tracker.record(start('first'));
  tracker.record(start('second'));
  tracker.record({
    method: 'Network.loadingFinished',
    params: { requestId: 'second' },
  });
  assert.deepEqual([...tracker.pending.keys()], ['first']);
  tracker.record(start('asset', 'http://localhost/script.js'));
  assert.equal(tracker.pending.size, 1);
});
void test('canceled and failed RSC requests remain failures instead of being silently ignored', () => {
  const tracker = new RscRequestTracker();
  for (const [id, errorText, canceled] of [
    ['aborted', 'net::ERR_ABORTED', true],
    ['offline', 'net::ERR_CONNECTION_REFUSED', false],
  ] as const) {
    tracker.record(start(id));
    tracker.record({
      method: 'Network.loadingFailed',
      params: { requestId: id, errorText, canceled },
    });
  }
  assert.equal(tracker.pending.size, 0);
  assert.deepEqual(
    tracker.failures.map((failure) => failure.errorText),
    ['net::ERR_ABORTED', 'net::ERR_CONNECTION_REFUSED'],
  );
});
void test('RSC headers identify requests without a cache query parameter', () => {
  const tracker = new RscRequestTracker();
  tracker.record({
    method: 'Network.requestWillBeSent',
    params: {
      requestId: 'header',
      request: { url: 'http://localhost/exercises', headers: { RSC: '1' } },
    },
  });
  assert.equal(tracker.pending.size, 1);
});

const cancellation: NetworkFailure = {
  requestId: 'navigation',
  url: 'http://localhost/exercises?_rsc=test',
  type: 'Fetch',
  errorText: 'net::ERR_ABORTED',
  canceled: true,
};
const verifiedNavigation: NetworkEvent[] = [
  {
    method: 'Network.requestWillBeSent',
    params: {
      requestId: 'navigation',
      frameId: 'frame',
      loaderId: 'document',
      request: { url: cancellation.url, headers: { RSC: '1' } },
    },
  },
  {
    method: 'Network.loadingFailed',
    params: {
      requestId: 'navigation',
      errorText: 'net::ERR_ABORTED',
      canceled: true,
    },
  },
  {
    method: 'Page.navigatedWithinDocument',
    params: { frameId: 'frame', url: 'http://localhost/exercises' },
  },
  {
    method: 'Verification.routeVerified',
    params: {
      frameId: 'frame',
      loaderId: 'document',
      url: 'http://localhost/exercises',
      label: 'all filters clear and 20 exercises rendered',
    },
  },
];
void test('a canceled RSC transport is expected only when its exact target commits and its UI is verified', () => {
  assert.equal(
    isVerifiedNavigationCancellation(cancellation, verifiedNavigation),
    true,
  );
});
void test('unverified and uncommitted RSC cancellations remain failures', () => {
  for (const method of [
    'Verification.routeVerified',
    'Page.navigatedWithinDocument',
  ]) {
    assert.equal(
      isVerifiedNavigationCancellation(
        cancellation,
        verifiedNavigation.filter((event) => event.method !== method),
      ),
      false,
    );
  }
});
void test('a different target or document cannot excuse an RSC cancellation', () => {
  for (const patch of [
    { url: 'http://localhost/resources' },
    { loaderId: 'different-document' },
  ]) {
    const events = structuredClone(verifiedNavigation);
    Object.assign(events[3].params!, patch);
    assert.equal(isVerifiedNavigationCancellation(cancellation, events), false);
  }
});
void test('connection errors, noncanceled failures and asset aborts are never classified as navigation cancellations', () => {
  for (const patch of [
    { errorText: 'net::ERR_CONNECTION_REFUSED' },
    { canceled: false },
    { type: 'Script' },
  ]) {
    assert.equal(
      isVerifiedNavigationCancellation(
        { ...cancellation, ...patch },
        verifiedNavigation,
      ),
      false,
    );
  }
});

void test('a later revisit cannot excuse a canceled navigation that already moved elsewhere', () => {
  const events = structuredClone(verifiedNavigation);
  events.splice(2, 0, {
    method: 'Page.navigatedWithinDocument',
    params: { frameId: 'frame', url: 'http://localhost/resources' },
  });
  assert.equal(isVerifiedNavigationCancellation(cancellation, events), false);
});
