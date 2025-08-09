/**
 * Jest Resolver for ES Modules with TypeScript
 * Handles .js imports in TypeScript files for ES modules
 */

import fs from 'fs';
import { dirname, resolve } from 'path';

function isFile(path) {
  try {
    const stat = fs.statSync(path);
    return stat.isFile();
  } catch {
    return false;
  }
}

function tryResolve(specifier, context) {
  // If it's a relative import ending with .js, try .ts first
  if (specifier.match(/^\.\.?\/.*\.js$/)) {
    const tsPath = specifier.replace(/\.js$/, '.ts');
    const resolvedTs = resolve(dirname(context), tsPath);
    if (isFile(resolvedTs)) {
      return resolvedTs;
    }
  }

  // Default resolution
  return null;
}

export default (path, options) => {
  // Use default resolver
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => {
      // Handle package.json type: module for Jest
      if (pkg.type === 'module') {
        pkg.main = pkg.main || 'index.js';
      }
      return pkg;
    },
    pathFilter: (pkg, path, relativePath) => {
      // Try to resolve .js imports to .ts files
      const resolved = tryResolve(relativePath, options.basedir);
      if (resolved) {
        return resolved;
      }
      return path;
    },
  });
};
