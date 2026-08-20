const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
    {
        ignores: ['projects/pdfViewers/src/test.ts']
    },
    {
        files: ['**/*.ts'],
        extends: [
            eslint.configs.recommended,
            ...tseslint.configs.recommended,
            ...angular.configs.tsRecommended
        ],
        plugins: {
            'only-warn': require('eslint-plugin-only-warn')
        },
        languageOptions: {
            parserOptions: {
                project: ['projects/pdfViewers/tsconfig.json']
            }
        },
        rules: {
            '@angular-eslint/component-class-suffix': 'off',
            '@angular-eslint/component-selector': 'off',
            '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: ['pdfviewer'], style: 'camelCase' }],
            '@angular-eslint/use-lifecycle-interface': 'off',
            '@typescript-eslint/consistent-type-definitions': 'error',
            '@typescript-eslint/dot-notation': 'off',
            '@typescript-eslint/explicit-member-accessibility': ['off', { accessibility: 'explicit' }],
            '@typescript-eslint/no-explicit-any': 'off',
            'no-underscore-dangle': 'off',
            'max-len': ['error', { code: 200 }]
        }
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
            ...angular.configs.templateAccessibility
        ]
    }
);
