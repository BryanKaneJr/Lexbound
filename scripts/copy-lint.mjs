// Copy lint: no em dashes (U+2014) in anything Lexbound-authored (code,
// comments, content, docs). Rewrite the sentence with a comma, colon,
// semicolon, parentheses or a full stop instead.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const SKIP = new Set(['node_modules', '.git', '.expo', 'dist', 'screens', 'ios', 'android']);
const EXT = /\.(ts|tsx|js|mjs|json|md|sh|yml)$/;
const DASH = String.fromCharCode(0x2014);
let bad = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name === 'package-lock.json') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (EXT.test(name)) {
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.includes(DASH)) {
            console.error(`${relative(root, path)}:${i + 1}: em dash`);
            bad++;
          }
        });
    }
  }
}

walk(root);
if (bad) process.exit(1);
