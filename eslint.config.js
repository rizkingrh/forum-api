import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import daStyle from 'eslint-config-dicodingacademy';
import vitest from '@vitest/eslint-plugin';

export default defineConfig([
  {
    plugins: {
      vitest,
    }
  },
  daStyle,
  { files: ['**/*.{js,mjs,cjs}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: { ...globals.browser, ...globals.node, ...vitest.environments.env.globals } } },
]);
