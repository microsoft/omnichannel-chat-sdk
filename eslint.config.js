const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const globals = require('globals');

module.exports = [
    eslint.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                ...globals.jest,
                NodeJS: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            '@typescript-eslint/ban-types': 'off',
            '@typescript-eslint/no-unused-expressions': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unsafe-function-type': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'caughtErrorsIgnorePattern': '^error$' }],
            'space-infix-ops': 'error',
            'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
            'indent': ['error', 4, { 'ignoredNodes': ['PropertyDefinition'] }],
            'no-trailing-spaces': 'error',
            'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
            'no-constant-binary-expression': 'off',
        },
    },
    {
        ignores: ['src/external/aria/**'],
    },
];
