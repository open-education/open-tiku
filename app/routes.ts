import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/tiku/index.tsx", [route(":textbookId", "routes/tiku/list.tsx"), route(":textbookId/similar", "routes/tiku/similar.tsx")]),
] satisfies RouteConfig;
