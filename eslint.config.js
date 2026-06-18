import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import daStyle from 'eslint-config-dicodingacademy';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  daStyle,
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js, vitest },
    rules: { camelcase: 'off' },
    extends: ['js/recommended'],
    languageOptions: { globals: { ...globals.browser, ...globals.node, ...vitest.environments.env.globals } }
  },
]);
