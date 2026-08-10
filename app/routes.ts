import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/home/main.tsx", [
    // 网站布局
    index("routes/home/index.tsx"),

    // 试卷
    route("paper", "routes/paper/index.tsx"),

    // 题目库
    route("question", "routes/question/index.tsx"),

    // 用户中心
    route("user", "routes/user/main.tsx", [
      // 用户中心布局
      index("routes/user/index.tsx"),

      // 系统设置
      route("setting/textbook", "routes/user/setting/textbook.tsx"),
      route("setting/ck", "routes/user/setting/ck.tsx"),
      route("setting/dict", "routes/user/setting/dict.tsx"),

      // 我的题目和审核
      route("question/my", "routes/user/question/index.tsx"),
      route("question/review", "routes/user/question/review.tsx"),

      // 我的试卷和审核
      route("paper/my", "routes/user/paper/index.tsx"),
      route("paper/review", "routes/user/paper/review.tsx"),
    ]),
  ]),
] satisfies RouteConfig;
