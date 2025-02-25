import sourceMaps from 'rollup-plugin-sourcemaps'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import fs from 'fs'
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

const libraryNameCamel = 'Vue-bloc'

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: libraryNameCamel,
      globals: {
        vue: 'vue',
        rxjs: 'rxjs',
        'rxjs/operators': 'rxjs.operators',
        '@billitech/bloc': '@billitech/bloc',
      },
      format: 'umd',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: ['vue', '@billitech/bloc', 'rxjs', 'rxjs/operators'],
  watch: {
    include: 'src/**',
  },
  plugins: [
    json(),
    typescript({ tsconfig: './tsconfig.json', sourceMap: true }),
    commonjs(),
    nodeResolve(),
    sourceMaps(),
  ],
}
