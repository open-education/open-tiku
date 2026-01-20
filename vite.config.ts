import {reactRouter} from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import {defineConfig} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/frontend/",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    hmr: {
      port: 24680, // 本地启动多个项目时需要指定其它端口, 端口可用即可, 默认是 24678
    },
  },
});
