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
    rollupOptions: {
      input: {
        code: resolve(__dirname, "src/code/index.ts"),
        ui: resolve(__dirname, "src/ui/main.ts")
      },
      output: {
        entryFileNames: "[name].js",
        format: "es"
      }
    },
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
