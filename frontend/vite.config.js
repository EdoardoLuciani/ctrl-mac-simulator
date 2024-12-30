import { resolve } from "path";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";
import { glob } from "glob";

export default defineConfig({
  plugins: [injectHTML()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        ...Object.fromEntries(
          glob.sync("src/pages/**/*.html").map((file) => [
            // Remove the src/pages prefix and .html suffix
            file.slice("src/pages/".length, -".html".length),
            resolve(__dirname, file),
          ]),
        ),
      },
    },
  },
  test: {
    exclude: ["**/e2e/**"],
  },

  // some other configuration
});
