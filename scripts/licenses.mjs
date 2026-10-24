import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import licenseChecker from 'license-checker';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

licenseChecker.init(
  { start: root, production: true, relativeLicensePath: true },
  (error, packages) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
      return;
    }

    const cleaned = {};
    for (const [name, info] of Object.entries(packages)) {
      const { path: _path, ...rest } = info;
      cleaned[name] = rest;
    }

    writeFileSync(
      resolve(root, 'dist/LICENSE.checker'),
      JSON.stringify(cleaned, null, 2)
    );
  }
);
