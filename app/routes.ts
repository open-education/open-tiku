import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/home/main.tsx", [index("routes/home/index.tsx"), route("paper", "routes/paper/index.tsx")]),
  route("/tiku", "routes/tiku/index.tsx", [route(":textbookId", "routes/tiku/list.tsx"), route(":textbookId/similar", "routes/tiku/similar.tsx")]),
] satisfies RouteConfig;
