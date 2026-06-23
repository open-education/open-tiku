import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/home/main.tsx", [
    index("routes/home/index.tsx"),
    route("paper", "routes/paper/index.tsx"),
    route("question", "routes/question/index.tsx"),
  ]),
] satisfies RouteConfig;
