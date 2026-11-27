import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // 首页
  route('/', 'routes/home/main.tsx', [
    // 网站首页
    index('routes/home/index.tsx'),

    // 题目搜索
    route('question', 'routes/home/question.tsx'),
    route('question/paper', 'routes/home/paper.tsx'),

    // 帮助文档
    route('faqs', 'routes/home/faqs.tsx'),
  ]),

  // 无验证无布局页面, 比如我的投诉, 无需登陆
  layout('routes/home/no-layout.tsx', [route('report', 'routes/home/report.tsx')]),

  // 验证权限
  layout('routes/auth.tsx', [
    // 业务空间
    route('/ops', 'routes/ops/main.tsx', [
      // 工作台
      index('routes/ops/index.tsx'),

      // 个性化
      route('my/custom', 'routes/ops/my/custom/index.tsx'),

      // 智能组卷
      route('paper', 'routes/ops/paper/index.tsx'),
      route('paper/level', 'routes/ops/paper/level.tsx'),

      // 我的贡献
      route('my/question', 'routes/ops/my/question/index.tsx'),
      route('my/question/add', 'routes/ops/my/question/add.tsx'),
      route('my/question/upload', 'routes/ops/my/question/upload.tsx'),
      route('my/question/task', 'routes/ops/my/question/task.tsx'),
      route('my/paper', 'routes/ops/my/paper/index.tsx'),
      route('my/paper/upload', 'routes/ops/my/paper/upload.tsx'),

      // 班级
      route('class', 'routes/ops/class/index.tsx'),

      // 学情
      route('my/analyze', 'routes/ops/my/analyze/index.tsx'),

      // 审核
      route('review/question', 'routes/ops/review/question.tsx'),
      route('review/paper', 'routes/ops/review/paper.tsx'),

      // 系统设置
      route('setting', 'routes/ops/setting/index.tsx'),
      route('setting/textbook', 'routes/ops/setting/textbook.tsx'),
      route('setting/ck', 'routes/ops/setting/ck.tsx'),
      route('setting/dict', 'routes/ops/setting/dict.tsx'),

      // 用户
      route('user/account', 'routes/ops/user/account.tsx'),
      route('user/session', 'routes/ops/user/session.tsx'),
    ]),

    // 学生
    route('/student', 'routes/student/main.tsx', [
      // 学生首页
      index('routes/student/index.tsx'),
      // 作业类表
      route('homework', 'routes/student/homework.tsx'),
    ]),

    // 无布局页面, 比如编辑等特定页面
    layout('routes/no-layout.tsx', [
      route('/ops/my/question/edit', 'routes/ops/my/question/edit.tsx'),
      route('/ops/my/paper/edit', 'routes/ops/my/paper/edit.tsx'),
      route('/student/homework/exam', 'routes/student/exam.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
