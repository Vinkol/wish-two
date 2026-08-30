import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import configPrettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'vite.config.ts'] },
  {
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react': reactPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
      'react/react-in-jsx-scope': 'off', // Для React 17+ не нужен импорт React в каждом файле
      'react/prop-types': 'off', // Используем TypeScript вместо prop-types
      '@typescript-eslint/no-explicit-any': 'warn', // Запрещаем any без явной необходимости
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ошибка на неиспользуемые переменные
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Защита от забытых console.log
    },
  },
  configPrettier
);
