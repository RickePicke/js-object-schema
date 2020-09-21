module.exports = {
    env: {
        browser: true,
        es6: true
    },
    plugins: [ 'jest' ],
    extends: [ 'standard', 'plugin:jest/recommended' ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module'
    },
    rules: {
        semi: ['error', 'always'],
        indent: ['error', 4],
        'standard/object-curly-even-spacing': [2, 'either'],
        'standard/array-bracket-even-spacing': [2, 'either'],
        'array-bracket-spacing': 'off',
        'space-before-function-paren': [2, 'never']
    }
};
