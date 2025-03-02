import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.CI ? "/okasmin-Parsons-P5Party-SP25/SpringSquad/" : "/",
  build: {
    target: "esnext", //browsers can handle the latest ES features
  },
  esbuild: {
    supported: {
      "top-level-await": true, //browsers can handle top-level-await features
    },
  },
});
