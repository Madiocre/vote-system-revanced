import { defineConfig } from "astro/config";
import react from "@astrojs/react";


import cloudflare from "@astrojs/cloudflare";


export default defineConfig({
  integrations: [react()],

  // static mode would make Astro.cookies a no-op — easy to miss
  output: "server",

  adapter: cloudflare()
});