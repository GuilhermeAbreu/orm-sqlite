export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/capacitor-orm-sqlite.js',
      format: 'iife',
      name: 'CapacitorOrmSqlite',
      globals: {
        '@capacitor/core': 'capacitorExports',
        '@capacitor-community/sqlite': 'capacitorCommunitySqlite'
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/capacitor-orm-sqlite.cjs.js',
      format: 'cjs',
      sourcemap: true,
      inlineDynamicImports: true,
    },
  ],
  external: ['@capacitor/core', '@capacitor-community/sqlite'],
};
