module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        '@typescript-eslint/ban-types': 'off',
        'space-infix-ops': 'error',
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'indent': ['error', 4],
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1 }],
    },
    ignorePatterns: [
        'src/external/aria/'
    ]
}