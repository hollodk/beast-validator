import { terser } from 'rollup-plugin-terser';

export default [
    // ESM build (for bundlers)
    {
        input: 'src/js/validate.js',
        output: {
            file: 'dist/validate.esm.js',
            format: 'es',
            sourcemap: true,
        },
    },

    // UMD build (for browsers via <script>)
    {
        input: 'src/js/validate.js',
        output: {
            file: 'dist/validate.umd.js',
            format: 'umd',
            name: 'BeastValidator',
            sourcemap: true,
        },
    },

    // Minified UMD build
    {
        input: 'src/js/validate.js',
        output: {
            file: 'dist/validate.min.js',
            format: 'umd',
            name: 'BeastValidator',
            sourcemap: false,
            plugins: [terser()],
        },
    },
];
