/** Reads one header, tolerating a `Headers` object or a plain record. */
export type HeaderLookup = (name: string) => string | null;

/**
 * Resolves the absolute origin used for share metadata from a header lookup and
 * the build-time `SITE_ORIGIN`.
 *
 * Priority:
 * 1. `SITE_ORIGIN`, inlined at build time (set it in CI for a fixed production
 *    domain so no host is baked into the source).
 * 2. The host the request actually arrived on, taken from the standard proxy
 *    headers. A brand-new Workers domain therefore advertises itself instead of
 *    the previous deployment's host.
 *
 * Returns `null` when neither is usable; callers then omit `metadataBase`.
 */
export function resolveSiteOrigin(
  lookup: HeaderLookup,
  configuredOrigin = readConfiguredOrigin(),
): URL | null {
  if (configuredOrigin) {
    const configured = toUrl(configuredOrigin);
    // An unusable SITE_ORIGIN must not silently fall through to the request
    // host: a typo in production config should be visible, not masked.
    return configured;
  }
  const host = firstHeaderValue(lookup('x-forwarded-host') ?? lookup('host'));
  if (!host) return null;
  const forwardedProto = firstHeaderValue(lookup('x-forwarded-proto'));
  const protocol =
    forwardedProto === 'http' || forwardedProto === 'https'
      ? forwardedProto
      : isLocalHost(host)
        ? 'http'
        : 'https';
  return toUrl(`${protocol}://${host}`);
}

/** Request-scoped wrapper used by `generateMetadata` in the root layout. */
export async function resolveMetadataBase(): Promise<URL | null> {
  if (readConfiguredOrigin()) return resolveSiteOrigin(() => null);
  try {
    // Imported lazily so this module stays loadable outside a request context
    // (for example by the unit tests).
    const { headers } = await import('next/headers');
    const requestHeaders = await headers();
    return resolveSiteOrigin((name) => requestHeaders.get(name));
  } catch {
    // Outside a request scope (for example during a static build).
    return null;
  }
}

function readConfiguredOrigin(): string | undefined {
  const configured = process.env.SITE_ORIGIN?.trim();
  return configured ? configured : undefined;
}

function isLocalHost(host: string): boolean {
  // IPv6 hosts are bracketed (`[::1]:8788`), so the port separator can only be
  // looked for after the closing bracket.
  const name = host.startsWith('[')
    ? (host.slice(1, host.indexOf(']')).toLowerCase() || host.toLowerCase())
    : (host.split(':')[0]?.toLowerCase() ?? '');
  return (
    name === 'localhost' ||
    name === '127.0.0.1' ||
    name === '::1' ||
    name === '0.0.0.0'
  );
}

/** Proxy headers may carry a comma-separated chain; the first entry is ours. */
function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(',')[0]?.trim();
  return first ? first : null;
}

function toUrl(origin: string): URL | null {
  try {
    return new URL(origin.startsWith('http') ? origin : `https://${origin}`);
  } catch {
    return null;
  }
}
