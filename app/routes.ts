import {index, layout, route, type RouteConfig,} from "@react-router/dev/routes";

export default [
    route("/", "routes/home/index.tsx", [index("routes/home/tiku.tsx")]),

    layout("routes/tiku/index.tsx", [
        route("tiku/:textbookKey","routes/tiku/list.tsx"), // 默认展示页面
    ]),
] satisfies RouteConfig;
