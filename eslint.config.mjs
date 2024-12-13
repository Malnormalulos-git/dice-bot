import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 'latest'
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        'require': 'readonly',
        'process': 'readonly',
        'module': 'readonly',
        'exports': 'readonly',
        'describe': 'readonly',
        'it': 'readonly',
        'expect': 'readonly',
        'beforeEach': 'readonly',
        'afterEach': 'readonly',
        'test': 'readonly',
        'jest': 'readonly'
      }
    },
    rules: {
      "no-undef": "off",

      "indent": ["error", 4, {
        "SwitchCase": 1,
        "VariableDeclarator": "first",
        "MemberExpression": 1
      }],

      "max-len": ["warn", {
        "code": 130,
        "tabWidth": 4,
        "ignoreComments": true,
        "ignoreUrls": true
      }],

      "semi": ["error", "always"], // Enforce semicolons at the end of statements
      "semi-spacing": ["error", {"before": false, "after": true}], // Space after semicolon

      // Spacing and formatting rules
      "keyword-spacing": ["error", { "before": true, "after": true }], // Space before and after keywords
      "space-before-blocks": ["error", "always"], // Space before opening brace
      "space-infix-ops": "error", // Space around operators
      "space-before-function-paren": ["error", {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
      }], // Spacing for function parentheses
      "object-curly-spacing": ["error", "always"], // Space inside object literals
      "array-bracket-spacing": ["error", "never"], // No space inside array brackets
      "computed-property-spacing": ["error", "never"], // No space inside computed properties

      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error"
    }
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended
];