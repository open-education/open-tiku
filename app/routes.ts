import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // 首页
  route('/', 'routes/home/main.tsx', [
    // 网站首页
    index('routes/home/index.tsx'),

    // Faqs
    route('/faqs', 'routes/help/faqs.tsx'),
  ]),

  // 业务空间
  layout('routes/layout.tsx', [
    // 工作台
    route('/ops', 'routes/ops/index.tsx'),

    // 个性化
    route('/ops/my/custom', 'routes/ops/my/custom/index.tsx'),

    // 题库中心
    route('/question', 'routes/question/index.tsx'),
    route('/question/paper', 'routes/question/paper.tsx'),

    // 智能组卷
    route('/ops/paper', 'routes/ops/paper/index.tsx'),

    // 我的贡献
    route('/ops/my/question', 'routes/ops/my/question/index.tsx'),
    route('/ops/my/question/add', 'routes/ops/my/question/add.tsx'),
    route('/ops/my/question/edit', 'routes/ops/my/question/edit.tsx'),
    route('/ops/my/question/upload', 'routes/ops/my/question/upload.tsx'),
    route('/ops/my/question/task', 'routes/ops/my/question/task.tsx'),
    route('/ops/my/paper', 'routes/ops/my/paper/index.tsx'),
    route('/ops/my/paper/upload', 'routes/ops/my/paper/upload.tsx'),
    route('/ops/my/paper/edit', 'routes/ops/my/paper/edit.tsx'),

    // 班级
    route('/ops/class', 'routes/ops/class/index.tsx'),

    // 学情
    route('/ops/my/analyze', 'routes/ops/my/analyze/index.tsx'),

    // 审核
    route('/ops/review/question', 'routes/ops/review/question.tsx'),
    route('/ops/review/paper', 'routes/ops/review/paper.tsx'),

    // 系统设置
    route('/ops/setting', 'routes/ops/setting/index.tsx'),
    route('/ops/setting/textbook', 'routes/ops/setting/textbook.tsx'),
    route('/ops/setting/ck', 'routes/ops/setting/ck.tsx'),
    route('/ops/setting/dict', 'routes/ops/setting/dict.tsx'),

    // 用户
    route('/ops/user/account', 'routes/ops/user/account.tsx'),
    route('/ops/user/session', 'routes/ops/user/session.tsx'),
  ]),
] satisfies RouteConfig;
