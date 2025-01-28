/* eslint-disable import/no-extraneous-dependencies */
import fs from 'smart-fs';
import { FlatCompat } from '@eslint/eslintrc';
import parser from '@babel/eslint-parser';
import blackfluxRulesPlugin from '@blackflux/eslint-plugin-rules';

const compat = new FlatCompat({
  baseDirectory: fs.dirname(import.meta.url),
  resolvePluginsRelativeTo: fs.dirname(import.meta.url)
});

export default [
  ...compat.extends(
    'airbnb-base',
    'plugin:mocha/recommended',
    'plugin:markdown/recommended-legacy'
  ),
  ...compat.env({ es6: true, node: true, mocha: true }),
  ...compat.plugins('json', 'mocha'),
  {
    plugins: {
      '@blackflux/rules': blackfluxRulesPlugin
    },
    languageOptions: {
      parser,
      parserOptions: { requireConfigFile: false }
    },
    rules: {
      '@blackflux/rules/c8-prevent-ignore': 1,
      '@blackflux/rules/kebab-case-enforce': 1,
      'max-len': ['error', { code: 120 }],
      'mocha/no-exclusive-tests': 'error',
      'prefer-destructuring': ['error', { object: false, array: false }],
      'comma-dangle': ['error', 'never'],
      indent: ['error', 2, { SwitchCase: 1 }],
      quotes: [2, 'single', { avoidEscape: true }],
      'linebreak-style': [2, 'unix'],
      semi: [2, 'always'],
      'no-unused-vars': [
        1,
        { vars: 'all', args: 'none', ignoreRestSiblings: true }
      ],
      'no-var': [1],
      'no-fallthrough': [1],
      'spaced-comment': [
        'error',
        'always',
        {
          line: { exceptions: ['-', '+'], markers: ['=', '!'] },
          block: {
            exceptions: ['-', '+'],
            markers: ['=', '!', ':', '::'],
            balanced: true
          }
        }
      ],
      '@blackflux/rules/prevent-typeof-object': 1,
      'mocha/no-mocha-arrows': 0,
      'mocha/no-hooks-for-single-case': 0,
      'import/no-useless-path-segments': [2, { commonjs: true }],
      'import/extensions': [2, 'always'],
      'import/prefer-default-export': 0
    }
  }
];
