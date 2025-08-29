// @ts-check
import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { files: ['**/*.{ts,tsx,cts,mts,js,cjs,mjs}'] },
  { ignores: ['lib', 'built', 'node_modules'] },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    files: ['src/**'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./src/tsconfig-eslint.json']
      }
    }
  },
  {
    extends: [eslint.configs.recommended, ...tseslint.configs.strictTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    files: ['tests/**'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tests/tsconfig-eslint.json']
      }
    }
  }
);
