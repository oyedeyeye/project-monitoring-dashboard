import path from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  // ESLint recommended config
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  // Stylistic plugin
  plugins.stylistic,
  // Import X plugin
  plugins.importX,
  // Airbnb base recommended config
  ...configs.base.recommended,
]);

const reactConfig = defineConfig([
  // React plugin
  plugins.react,
  // React hooks plugin
  plugins.reactHooks,
  // React JSX A11y plugin
  plugins.reactA11y,
  // Airbnb React recommended config
  ...configs.react.recommended,
]);

const typescriptConfig = defineConfig([
  // TypeScript ESLint plugin
  plugins.typescriptEslint,
  // Airbnb base TypeScript config
  ...configs.base.typescript,
  // Airbnb React TypeScript config
  ...configs.react.typescript,
]);

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  {
    name: 'project/ignores',
    // Standalone script, not part of the app's TS project (tsconfig.app.json
    // only includes "src"), so type-aware linting can't resolve it.
    ignores: ['scripts/**'],
  },
  // JavaScript config
  ...jsConfig,
  // React config
  ...reactConfig,
  // TypeScript config
  ...typescriptConfig,
  {
    name: 'project/react-jsx-runtime-overrides',
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // This project uses React 19 with the automatic JSX runtime
      // (tsconfig "jsx": "react-jsx"), so React no longer needs to be
      // imported/in-scope for JSX to work — these Airbnb rules predate
      // that runtime and would otherwise flag ~1000 valid call sites.
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },
]);
