import { cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

/**
 * Copy a single file into `dist`, creating its parent directory when needed.
 *
 * @param {string} source - Path relative to the project root.
 * @param {string} target - Path relative to `dist`.
 */
function copyFile(source, target) {
  const destination = resolve(dist, target);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(resolve(root, source), destination);
}

/**
 * Expand include directives in a license document.
 *
 * @param {string} content - License document.
 * @returns {string} Document with the referenced files inlined.
 */
function expandIncludes(content) {
  return content.replace(
    /\/\*=include\s+([^*]+?)\s*\*\//g,
    (_match, file) => readFileSync(resolve(root, file.trim()), 'utf8')
  );
}

copyFile('assets/html/index.html', 'index.html');
copyFile('assets/css/savehtml.css', 'css/savehtml.css');
copyFile('LICENSE', 'LICENSE');
writeFileSync(
  resolve(dist, 'LICENSE.dependencies'),
  expandIncludes(readFileSync(resolve(root, 'LICENSE.dependencies'), 'utf8'))
);
cpSync(resolve(root, 'assets/image'), resolve(dist, 'image'), {
  recursive: true
});
