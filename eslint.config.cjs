// @ts-check
const prettierPlugin = require('eslint-plugin-prettier');
const { readFileSync } = require('fs');
const { join } = require('path');

const prettierRules = JSON.parse(readFileSync(join(__dirname, '.prettierrc'), 'utf8'));

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      '**/server/chunks/**',
      '**/client/**',
    ],
  },
  {
    rules: {
      // Disable all unicorn rules
      'unicorn/no-array-reduce': 'off',
      'unicorn/*': 'off',
    },
  },
  {
    files: ['**/*.{js,ts,vue}', '*.js', '*.ts', '*.vue'],
    plugins: {
      prettier: prettierPlugin,
      vue: require('eslint-plugin-vue'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'prettier/prettier': ['error', prettierRules],
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message:
            'Use useFetch() or $fetch() for SSR compatibility. Direct fetch() calls can cause hydration mismatches.',
        },
      ],

      // Warn about window/document in setup script
      'no-restricted-syntax': [
        'error',

        {
          selector: 'MemberExpression[object.name="document"]',
          message:
            'document is not available during SSR. Use onMounted() lifecycle hook or process.client check.',
        },
        {
          selector: 'MemberExpression[object.name="localStorage"]',
          message:
            'localStorage is not available during SSR. Use onMounted() lifecycle hook or process.client check.',
        },
        {
          selector: 'MemberExpression[object.name="sessionStorage"]',
          message:
            'sessionStorage is not available during SSR. Use onMounted() lifecycle hook or process.client check.',
        },
      ],

      // Vue specific rules for better component structure
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],

      // Require explicit imports (since auto-imports are disabled)
      // Note: Skip undefined component check as NuxtUI components are globally available
      // 'vue/no-undef-components': 'error',

      // Force ~/ prefix for internal imports
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '../components/*',
                './components/*',
                '../composables/*',
                './composables/*',
                '../utils/*',
                './utils/*',
                '../assets/*',
                './assets/*',
                '../layouts/*',
                './layouts/*',
                '../pages/*',
                './pages/*',
                '../plugins/*',
                './plugins/*',
                '../middleware/*',
                './middleware/*',
                '../stores/*',
                './stores/*',
              ],
              message:
                'Use ~/path instead of relative imports for internal modules. Example: import MyComponent from "~/components/MyComponent.vue"',
            },
          ],
        },
      ],

      // Prevent console.log in production
      'no-console': [
        'warn',
        {
          allow: ['log', 'warn', 'error'],
        },
      ],

      // Ensure proper TypeScript usage
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Allow any type in some cases
      '@typescript-eslint/no-explicit-any': 'off',

      // Disable Nuxt config key order checking
      'nuxt/nuxt-config-keys-order': 'off',
    },
  },
  // Add Vue-specific configuration
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require('vue-eslint-parser'),
      parserOptions: {
        parser: {
          ts: require('@typescript-eslint/parser'),
          js: 'espree',
          '<template>': 'espree',
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
  // Add TypeScript-specific configuration
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
];
