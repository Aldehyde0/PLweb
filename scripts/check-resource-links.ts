import { learningResources } from '../lib/resources.ts';

const limitArg = process.argv.find((arg) => arg.startsWith('--limit='));
const limit = limitArg
  ? Math.max(1, Number(limitArg.split('=')[1]) || learningResources.length)
  : learningResources.length;
const selected = learningResources.slice(0, limit);

async function check(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    let response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': 'personal-learning-resource-check/1.0' },
    });
    if (response.status === 405 || response.status === 403)
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'user-agent': 'personal-learning-resource-check/1.0' },
      });
    return {
      status: response.status,
      ok: response.ok,
      finalUrl: response.url,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      finalUrl: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

let failures = 0;
for (const resource of selected) {
  const result = await check(resource.url);
  if (!result.ok) failures += 1;
  console.log(
    JSON.stringify({
      id: resource.id,
      status: result.status,
      ok: result.ok,
      url: resource.url,
      finalUrl: result.finalUrl,
      checkedAt: new Date().toISOString(),
    }),
  );
}
if (failures) {
  console.error(`${failures} / ${selected.length} resources need review.`);
  process.exitCode = 1;
}
