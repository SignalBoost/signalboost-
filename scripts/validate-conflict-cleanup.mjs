import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.next',
  'node_modules'
]);
const localeCodes = ['en', 'es', 'pt', 'pl', 'ru'];
const conflictMarkerPattern = /^(<<<<<<<|=======|>>>>>>>)(?:\s|$)/m;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...await walk(path.join(directory, entry.name)));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(path.join(directory, entry.name));
    }
  }

  return files;
}

function flattenKeys(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix.slice(0, -1)];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, `${prefix}${key}.`)
  );
}

async function findConflictMarkers() {
  const files = await walk(root);
  const matches = [];

  for (const file of files) {
    const relativePath = path.relative(root, file);
    const buffer = await readFile(file);

    if (buffer.includes(0)) {
      continue;
    }

    const content = buffer.toString('utf8');
    if (conflictMarkerPattern.test(content)) {
      matches.push(relativePath);
    }
  }

  return matches;
}

async function validateLocaleKeys() {
  const localeKeys = new Map();

  for (const code of localeCodes) {
    const content = await readFile(path.join(root, 'locales', `${code}.json`), 'utf8');
    localeKeys.set(code, new Set(flattenKeys(JSON.parse(content)).filter(Boolean)));
  }

  const allKeys = new Set([...localeKeys.values()].flatMap((keys) => [...keys]));
  const missingByLocale = [];

  for (const [code, keys] of localeKeys) {
    const missing = [...allKeys].filter((key) => !keys.has(key)).sort();
    if (missing.length) {
      missingByLocale.push({ code, missing });
    }
  }

  return missingByLocale;
}

const conflictFiles = await findConflictMarkers();
const missingLocaleKeys = await validateLocaleKeys();

if (conflictFiles.length || missingLocaleKeys.length) {
  if (conflictFiles.length) {
    console.error('Conflict markers found:');
    for (const file of conflictFiles) {
      console.error(`- ${file}`);
    }
  }

  if (missingLocaleKeys.length) {
    console.error('Missing locale keys found:');
    for (const { code, missing } of missingLocaleKeys) {
      console.error(`- ${code}: ${missing.join(', ')}`);
    }
  }

  process.exit(1);
}

console.log('Conflict cleanup validation passed: no merge markers and locale keys match.');
