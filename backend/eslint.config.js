import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // 📏 Clean Code Policy - File Size Limits
      'max-lines': [
        'warn',
        {
          max: 250,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // 📏 Function Complexity Limits
      'max-lines-per-function': [
        'warn',
        {
          max: 50,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      // 📏 Cyclomatic Complexity - Increased for clean branching
      complexity: ['warn', { max: 12 }],
      // 📏 Nesting Depth
      'max-depth': ['warn', { max: 4 }],
      // 📏 Parameter Count
      'max-params': ['warn', { max: 5 }],
      'no-console': 'off', // Allow console in backend
    },
  },
  {
    files: [
      '**/*.test.{ts,js}',
      '**/tests/**/*.{ts,js}',
      '**/fixtures/**/*.{ts,js}',
      '**/*-test.{ts,js}',
      '**/test-*.{ts,js}',
      '**/*-runner.{ts,js}', // Include test runners
      '**/extended-*.{ts,js}', // Include extended test files
      '**/comprehensive-*.{ts,js}', // Include comprehensive test files
    ],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        ...globals.jest,
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        it: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'unused-imports': unusedImports,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'unused-imports/no-unused-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn', // Relaxed for test files
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // 📏 Relaxed limits for test files
      'max-lines': [
        'warn',
        {
          max: 400, // Allow longer test files for comprehensive coverage
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      'max-lines-per-function': [
        'warn',
        {
          max: 75, // Increased limit for test functions
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      complexity: ['warn', { max: 15 }], // Higher complexity for test scenarios
      'max-depth': ['warn', { max: 5 }], // Slightly deeper nesting for test setups
      'no-console': 'off',
    },
  },
];
