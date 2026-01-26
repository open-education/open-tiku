import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/tiku/index.tsx", [route(":textbookId", "routes/tiku/list.tsx"), route(":textbookId/similar", "routes/tiku/similar.tsx")]),
  route("/test", "routes/test/index.tsx", [
    route(":textbookId", "routes/test/list.tsx"),
    route(":textbookId/add", "routes/test/add.tsx"),
    route(":textbookId/:testId", "routes/test/info.tsx"),
  ]),
] satisfies RouteConfig;
