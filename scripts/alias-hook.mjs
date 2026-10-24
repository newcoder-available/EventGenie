import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve as resolvePath } from "node:path";

/**
 * Teaches `node --test` the "@/*" path alias from tsconfig.json, and fills in
 * the extension TypeScript lets source files omit. Test-only: the app itself
 * is resolved by the bundler.
 */
const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

function firstExisting(basePath) {
  for (const suffix of CANDIDATES) {
    const candidate = basePath + suffix;
    if (existsSync(candidate) && !candidate.endsWith("/")) return candidate;
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let target = null;

    if (specifier.startsWith("@/")) {
      target = firstExisting(join(ROOT, "src", specifier.slice(2)));
    } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      const fromDir = dirname(fileURLToPath(context.parentURL));
      target = firstExisting(resolvePath(fromDir, specifier));
    }

    if (target) return { url: pathToFileURL(target).href, shortCircuit: true };
    return nextResolve(specifier, context);
  },
});
