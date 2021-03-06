import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import remark from 'rollup-plugin-remark'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), {...remark(), enforce: 'post'}],
  esbuild: { jsxInject: `import React from 'react'` }
})
