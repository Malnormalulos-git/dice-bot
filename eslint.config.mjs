import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
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
            // TypeScript rules
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",

            // Indentation and line length
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

            // Semicolons
            "semi": ["error", "always"],
            "semi-spacing": ["error", {"before": false, "after": true}],

            // Spacing and formatting rules
            "keyword-spacing": ["error", {"before": true, "after": true}],
            "space-before-blocks": ["error", "always"],
            "space-infix-ops": "error",
            "space-before-function-paren": ["error", {
                "anonymous": "always",
                "named": "never",
                "asyncArrow": "always"
            }],
            "object-curly-spacing": ["error", "never"],
            "array-bracket-spacing": ["error", "never"],
            "computed-property-spacing": ["error", "never"],

            // Code quality rules
            "no-debugger": "error",
            "prefer-const": "error",
            "no-undef": "off" // TypeScript handles this
        }
    },
    {
        ignores: ["dist/**", "node_modules/**"]
    }
);