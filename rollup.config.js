import * as path from 'path'
import sourcemaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'src/index.ts',
  output: [
    {
      file: path.resolve(__dirname, 'dist/index.js'),
      name: 'TsCoder',
      format: 'umd',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      typescript: require('ttypescript'),
      tsconfigDefaults: {
        compilerOptions: {
          plugins: [{ transform: '@zerollup/ts-transform-paths' }],
        },
      },
      useTsconfigDeclarationDir: true,
    }),
    sourcemaps(),
  ],
}
