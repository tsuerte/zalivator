import { defineConfig } from "vite";
import { resolve } from "path";
export default defineConfig({
  base: "./",
  esbuild: {
    target: "es2016"
  },
  build: {
    target: "es2016",
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/code/index.ts"),
      formats: ["iife"],
      fileName: () => "code.js",
      name: "ZalivatorPlugin"
    },
    rollupOptions: {},
    minify: "terser",
    terserOptions: {
      ecma: 2016,
      compress: {
        ecma: 2016
      },
      format: {
        ecma: 2016
      }
    }
  }
});
