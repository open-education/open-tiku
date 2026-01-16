import {route, type RouteConfig,} from "@react-router/dev/routes";

export default [
  route("/", "routes/tiku/index.tsx", [
    route(":id", "routes/tiku/list.tsx"),
  ]),
] satisfies RouteConfig;
