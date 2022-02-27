/*
 * Licensed under the MIT License (https://opensource.org/licenses/MIT).
 * Find the full license text in the LICENSE file of the project root.
 */
module.exports = {
  root: true,
  env: { browser: true },
  ignorePatterns: ["projects/**/*"],
  overrides: [
    {
      files: ["*.ts"],
      plugins: ["eslint-plugin-prefer-arrow"],
      parserOptions: {
        project: ["tsconfig.json", "e2e/tsconfig.json"],
        createDefaultProgram: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates",
      ],
      rules: {
        "@angular-eslint/no-host-metadata-property": "off",
        "@angular-eslint/no-input-rename": "error",
        "@angular-eslint/no-inputs-metadata-property": "error",
        "@angular-eslint/no-output-native": "error",
        "@angular-eslint/no-output-on-prefix": "error",
        "@angular-eslint/no-output-rename": "error",
        "@angular-eslint/no-outputs-metadata-property": "error",
        "@angular-eslint/use-lifecycle-interface": "error",
        "@angular-eslint/use-pipe-transform-interface": "error",
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@angular-eslint/component-selector": [
          "error",
          {
            style: "kebab-case",
            type: "element",
          },
        ],
        "@angular-eslint/directive-selector": [
          "error",
          {
            style: "camelCase",
            type: "attribute",
          },
        ],
        "@typescript-eslint/ban-types": [
          "error",
          {
            types: {
              Object: {
                message:
                  "Avoid using the `Object` type. Did you mean `object`?",
              },
              Function: {
                message:
                  "Avoid using the `Function` type. Prefer a specific function type, like `() => void`.",
              },
              Boolean: {
                message:
                  "Avoid using the `Boolean` type. Did you mean `boolean`?",
              },
              Number: {
                message:
                  "Avoid using the `Number` type. Did you mean `number`?",
              },
              String: {
                message:
                  "Avoid using the `String` type. Did you mean `string`?",
              },
              Symbol: {
                message:
                  "Avoid using the `Symbol` type. Did you mean `symbol`?",
              },
            },
          },
        ],
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/member-delimiter-style": [
          "error",
          {
            multiline: {
              delimiter: "semi",
              requireLast: true,
            },
            singleline: {
              delimiter: "semi",
              requireLast: false,
            },
          },
        ],
        "@typescript-eslint/naming-convention": "error",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-inferrable-types": [
          "error",
          {
            ignoreParameters: true,
          },
        ],
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-shadow": [
          "error",
          {
            hoist: "all",
          },
        ],
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/quotes": ["error", "single", { avoidEscape: true }],
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/triple-slash-reference": [
          "error",
          {
            path: "always",
            types: "prefer-import",
            lib: "always",
          },
        ],
        "@typescript-eslint/type-annotation-spacing": "error",
        "@typescript-eslint/unified-signatures": "error",
        "arrow-body-style": "error",
        "arrow-parens": ["off", "as-needed"],
        complexity: "off",
        "constructor-super": "error",
        curly: "error",
        "dot-notation": "error",
        "eol-last": "error",
        eqeqeq: ["error", "smart"],
        "guard-for-in": "error",
        "id-denylist": [
          "error",
          "any",
          "Number",
          "number",
          "String",
          "string",
          "Boolean",
          "boolean",
          "Undefined",
          "undefined",
        ],
        "id-match": "error",
        "max-classes-per-file": "off",
        "max-len": [
          "error",
          {
            code: 150,
          },
        ],
        "new-parens": "error",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-console": [
          "error",
          {
            allow: [
              "log",
              "warn",
              "dir",
              "timeLog",
              "assert",
              "clear",
              "count",
              "countReset",
              "group",
              "groupEnd",
              "table",
              "dirxml",
              "error",
              "groupCollapsed",
              "Console",
              "profile",
              "profileEnd",
              "timeStamp",
              "context",
            ],
          },
        ],
        "no-debugger": "error",
        "no-empty": "off",
        "no-empty-function": "off",
        "no-eval": "error",
        "no-fallthrough": "off",
        "no-invalid-this": "off",
        "no-new-wrappers": "error",
        "no-restricted-imports": ["error", "rxjs/Rx"],
        "no-shadow": "error",
        "no-throw-literal": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": [2, { allowAfterThis: true }],
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-use-before-define": "off",
        "no-var": "error",
        "object-shorthand": "error",
        "one-var": ["error", "never"],
      },
    },
    {
      files: ["*.html"],
      extends: ["plugin:@angular-eslint/template/recommended"],
      rules: {},
    },
  ],
};
