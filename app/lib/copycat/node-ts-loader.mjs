/**
 * Node loader so `node --test` can import this folder's TypeScript and JSON.
 * Next resolves those imports itself; this is only for the tone catalog test.
 */
import { readFileSync } from 'node:fs';

export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !/\.[a-z0-9]+$/i.test(specifier)) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      return nextResolve(`${specifier}.json`, context);
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.json')) {
    const source = `export default ${readFileSync(new URL(url), 'utf8')};\n`;
    return { format: 'module', source, shortCircuit: true };
  }
  return nextLoad(url, context);
}
