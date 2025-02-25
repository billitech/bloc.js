import sourceMaps from 'rollup-plugin-sourcemaps'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'

import fs from 'fs'
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

const libraryNameCamel = 'Bloc'

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name: libraryNameCamel,
      globals: {
        rxjs: 'rxjs',
        'rxjs/operators': 'rxjs.operators',
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
  external: ['rxjs', 'rxjs/operators'],
  watch: {
    include: 'src/**',
  },
  plugins: [json(), typescript(), commonjs(), nodeResolve(), sourceMaps()],
}
