import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/index.js',
    output: [
        {
            exports: 'default',
            file: 'dist/js-object-schema.common.js',
            format: 'cjs'
        },
        {
            exports: 'default',
            file: 'dist/js-object-schema.es.js',
            format: 'es'
        },
        {
            exports: 'default',
            plugins: [
                terser()
            ],
            file: 'dist/js-object-schema.common.min.js',
            format: 'cjs'
        }
    ],
    plugins: [
        babel({ babelHelpers: 'bundled' })
    ]
};
