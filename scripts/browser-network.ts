export interface NetworkEvent {
  method?: string;
  params?: Record<string, unknown>;
}

export interface NetworkFailure {
  requestId: string;
  url: string;
  type: string;
  errorText: string;
  canceled: boolean;
}

/** A cancellation alone is insufficient: require a committed, verified target
 * in the same frame and document. Other canceled requests remain failures. */
export function isVerifiedNavigationCancellation(
  failure: NetworkFailure,
  events: readonly NetworkEvent[],
): boolean {
  if (
    !failure.canceled ||
    failure.errorText !== 'net::ERR_ABORTED' ||
    failure.type !== 'Fetch'
  )
    return false;
  const start = events.findIndex(
    (event) =>
      event.method === 'Network.requestWillBeSent' &&
      event.params?.requestId === failure.requestId,
  );
  const end = events.findIndex(
    (event) =>
      event.method === 'Network.loadingFailed' &&
      event.params?.requestId === failure.requestId,
  );
  if (start < 0 || end <= start) return false;
  const params = events[start].params!;
  const request = params.request as
    | { url?: string; headers?: Record<string, unknown> }
    | undefined;
  if (
    !request?.url ||
    request.url !== failure.url ||
    typeof params.frameId !== 'string' ||
    typeof params.loaderId !== 'string'
  )
    return false;
  const target = new URL(request.url);
  const isRsc =
    target.searchParams.has('_rsc') ||
    Object.entries(request.headers ?? {}).some(
      ([key, value]) => key.toLowerCase() === 'rsc' && value === '1',
    );
  if (!isRsc) return false;
  target.searchParams.delete('_rsc');
  return events.some(
    (event, index) =>
      index > end &&
      event.method === 'Verification.routeVerified' &&
      event.params?.url === target.href &&
      event.params?.frameId === params.frameId &&
      event.params?.loaderId === params.loaderId &&
      !events
        .slice(end + 1, index)
        .some(
          (candidate) =>
            (candidate.method === 'Page.navigatedWithinDocument' ||
              candidate.method === 'Verification.routeVerified') &&
            candidate.params?.frameId === params.frameId &&
            candidate.params?.url !== target.href,
        ) &&
      events
        .slice(start + 1, index)
        .some(
          (candidate) =>
            candidate.method === 'Page.navigatedWithinDocument' &&
            candidate.params?.frameId === params.frameId &&
            candidate.params?.url === target.href,
        ),
  );
}

/** URL/history changes can precede the end of an RSC response body. */
export class RscRequestTracker {
  readonly pending = new Map<string, string>();
  readonly failures: { url: string; errorText: string; canceled: boolean }[] =
    [];
  revision = 0;

  record(event: NetworkEvent): void {
    const params = event.params ?? {};
    const id = typeof params.requestId === 'string' ? params.requestId : null;
    if (!id) return;
    if (event.method === 'Network.requestWillBeSent') {
      const request = params.request as
        | { url?: string; headers?: Record<string, unknown> }
        | undefined;
      if (!request?.url) return;
      const headers = Object.entries(request.headers ?? {});
      const isRsc =
        headers.some(
          ([name, value]) => name.toLowerCase() === 'rsc' && value === '1',
        ) || new URL(request.url).searchParams.has('_rsc');
      if (isRsc) {
        this.pending.set(id, request.url);
        this.revision += 1;
      }
      return;
    }
    const url = this.pending.get(id);
    if (
      !url ||
      (event.method !== 'Network.loadingFinished' &&
        event.method !== 'Network.loadingFailed')
    )
      return;
    if (event.method === 'Network.loadingFailed')
      this.failures.push({
        url,
        errorText:
          typeof params.errorText === 'string'
            ? params.errorText
            : 'unknown failure',
        canceled: params.canceled === true,
      });
    this.pending.delete(id);
    this.revision += 1;
  }
}
