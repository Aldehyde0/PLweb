import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';
import hostingConfig from './.openai/hosting.json';

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  '00000000-0000-4000-8000-000000000000';

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === 'seatbelt';

/**
 * The Sites plugin only adds a local sign-in shim for the Sites preview shell and
 * copies `.openai/hosting.json` into `dist/.openai`. Neither is used by the app or
 * by the Cloudflare Workers deployment, and it is imported lazily so a Workers
 * build never depends on the package being installed. Set `SITES_PLUGIN=1` to
 * re-enable it when building inside the Sites pipeline.
 */
const useSitesPlugin = process.env.SITES_PLUGIN === '1';

async function sitesPlugins() {
  if (!useSitesPlugin) return [];
  try {
    const { sites } = await import('@openai/sites-vite-plugin');
    return [sites()];
  } catch {
    throw new Error(
      'SITES_PLUGIN=1 was set but @openai/sites-vite-plugin is not installed.',
    );
  }
}

const localBindingConfig = {
  main: 'vinext/server/fetch-handler',
  compatibility_flags: ['nodejs_compat'],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: 'site-creator-d1',
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: 'site-creator-r2',
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= 'false';
  process.env.WRANGLER_LOG_PATH ??= '.wrangler/logs';
  process.env.MINIFLARE_REGISTRY_PATH ??= '.wrangler/registry';

  // Keep Wrangler's log path snapshot while the Cloudflare plugin is imported.
  const { cloudflare } = await import('@cloudflare/vite-plugin');

  // `SITE_ORIGIN` is read from the environment at build time so share metadata
  // points at the domain this build is deployed to, instead of a host baked into
  // the source. It is left undefined when unset, and the app then falls back to
  // the origin the request actually arrived on.
  const siteOrigin = process.env.SITE_ORIGIN?.trim();

  return {
    css: { postcss: { plugins: [tailwindcss()] } },
    define: {
      'process.env.SITE_ORIGIN': JSON.stringify(siteOrigin ?? ''),
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      ...(await sitesPlugins()),
      cloudflare({
        viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
        config: localBindingConfig,
      }),
    ],
  };
});
