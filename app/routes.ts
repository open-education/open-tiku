import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/tiku/index.tsx", [route(":id", "routes/tiku/list.tsx")]),
  route("/test", "routes/test/index.tsx", [
    route(":textbookId", "routes/test/list.tsx"),
    route(":textbookId/:testId", "routes/test/info.tsx"),
  ]),
] satisfies RouteConfig;
