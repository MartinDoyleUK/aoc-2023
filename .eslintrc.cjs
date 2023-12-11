const [OFF, _WARN, ERROR] = [0, 1, 2];

module.exports = {
  extends: ['canonical/auto'],
  overrides: [
    {
      files: ['package.json'],
      rules: {
        // Specific sorting rules for the package.json file
        'jsonc/sort-keys': [
          ERROR,
          {
            order: [
              // Project information
              'name',
              'version',
              'description',
              'keywords',
              'homepage',
              'bugs',
              'license',
              'author',
              'contributors',
              'repository',
              'funding',
              'private',

              // Technical usage information
              'engines',
              'engineStrict',
              'os',
              'cpu',
              'publishConfig',
              'workspaces',
              'type',
              'config',

              // Output/build definitions
              'files',
              'directories',
              'packageManager',
              'exports',
              'imports',
              'main',
              'browser',
              'bin',
              'man',

              // Scripts
              'scripts',

              // Other configuration
              'lint-staged',
              'nutkit',

              // Dependency related configuration
              'dependencies',
              'devDependencies',
              'peerDependencies',
              'peerDependenciesMeta',
              'bundleDependencies',
              'optionalDependencies',
              'overrides',
            ],
            pathPattern: '^$',
          },
          {
            order: { type: 'asc' },
            pathPattern:
              '^(?:dev|peer|optional|bundle)?[Dd]ependencies(?:Meta)?$',
          },
        ],
      },
    },
    {
      extends: ['canonical/prettier'],
      files: ['*.js', '*.ts', '*.tsx'],
      rules: {
        'prettier/prettier': [
          ERROR,
          {
            arrowParens: 'always',
            bracketSameLine: false,
            bracketSpacing: true,
            endOfLine: 'lf',
            printWidth: 80,
            proseWrap: 'preserve',
            quoteProps: 'as-needed',
            semi: true,
            singleAttributePerLine: true,
            singleQuote: true,
            tabWidth: 2,
            trailingComma: 'all',
            useTabs: false,
          },
          {
            usePrettierrc: false,
          },
        ],
      },
    },
  ],
  parserOptions: {
    babelOptions: {
      parserOpts: {
        plugins: [
          // Allows `import { foo } from 'foo.json' assert { type: 'json' }`
          'importAssertions',
        ],
      },
    },
  },
  rules: {
    // Always use T[] instead of Array<T>
    '@typescript-eslint/array-type': [ERROR, { default: 'array' }],

    // Prefer interfaces over type aliases
    '@typescript-eslint/consistent-type-definitions': [ERROR, 'interface'],

    // Use non-null assertion lots in testing because of known inputs, so disable this
    '@typescript-eslint/no-non-null-assertion': OFF,

    // Do not alert for unused vars if there's an explicit underscore prefix to ignore them, also allow vars to be unused if they're removing values from a rest destructuring
    '@typescript-eslint/no-unused-vars': [
      ERROR,
      {
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
      },
    ],

    // Disabled as per recommendation at https://typescript-eslint.io/rules/padding-line-between-statements/
    '@typescript-eslint/padding-line-between-statements': OFF,

    // Do not use inline type imports as it doesn't work reliably
    'canonical/prefer-inline-type-import': OFF,

    // Disable forcing variable names to regex, doesn't allow numbers
    'id-match': OFF,

    // Default exports should not be used unless necessary (https://basarat.gitbook.io/typescript/main-1/defaultisbad)
    'import/no-default-export': ERROR,

    // Strictly control the order and spacing of imports
    'import/order': [
      ERROR,
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        distinctGroup: true,
        groups: [
          'type',
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'internal',
            pattern: '@/**',
            position: 'after',
          },
        ],
      },
    ],

    // Allow the use of console.log
    'no-console': OFF,

    // This needs to be off when using the @typescript-eslint/no-unused-vars rule
    'no-unused-vars': OFF,

    // This needs to be off when using the @typescript-eslint/padding-line-between-statements rule
    'padding-line-between-statements': OFF,

    // These clash with the above import/order rule
    'simple-import-sort/exports': OFF,

    'simple-import-sort/imports': OFF,

    // Disable strict control of error argument name in catch clauses
    'unicorn/catch-error-name': OFF,

    // For loops are used a lot in Advent of Code!
    'unicorn/no-for-loop': OFF,

    // Disable strict control of certain argument names
    'unicorn/prevent-abbreviations': OFF,
  },
};
