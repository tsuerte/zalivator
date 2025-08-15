import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// В ESM __dirname не определён — вычисляем вручную
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  esbuild: {
    target: "es2019",
  },
  build: {
    target: "es2019",
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/code/index.ts"),
      formats: ["iife"],
      fileName: () => "code.js",
      name: "ZalivatorPlugin",
    },
    rollupOptions: {},
    minify: "terser",
    terserOptions: {
      ecma: 2019,
      compress: {
        ecma: 2019,
      },
      format: {
        ecma: 2019,
      },
    },
  },
});
