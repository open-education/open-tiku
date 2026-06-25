import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/home/main.tsx", [
    index("routes/home/index.tsx"),
    route("paper", "routes/paper/index.tsx"),
    route("question", "routes/question/index.tsx"),
    route("user", "routes/user/main.tsx", [
      index("routes/user/index.tsx"),
      route("question", "routes/user/question.tsx"),
      route("paper", "routes/user/paper.tsx"),
      route("review", "routes/user/review.tsx"),
      route("setting", "routes/user/setting.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
