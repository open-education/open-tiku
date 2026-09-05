import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  route('/', 'routes/home/main.tsx', [
    layout('routes/home/layout.tsx', [
      // 网站布局
      index('routes/home/index.tsx'),

      // 试卷
      route('paper', 'routes/home/paper/index.tsx'),

      // 题目库
      route('question', 'routes/home/question/index.tsx'),

      // 帮助中心
      route('faqs', 'routes/home/help/faqs.tsx'),
    ]),

    // 用户中心
    route('user', 'routes/user/main.tsx', [
      // 用户中心布局
      index('routes/user/index.tsx'),

      // 系统设置
      route('setting/textbook', 'routes/user/setting/textbook.tsx'),
      route('setting/ck', 'routes/user/setting/ck.tsx'),
      route('setting/dict', 'routes/user/setting/dict.tsx'),

      // 我的题目和审核
      route('question/my', 'routes/user/question/index.tsx'),
      route('question/review', 'routes/user/question/review.tsx'),

      // 我的试卷和审核
      route('paper/my', 'routes/user/paper/index.tsx'),
      route('paper/review', 'routes/user/paper/review.tsx'),

      // 我的班级
      route('class/my', 'routes/user/class/index.tsx'),

      // 第三方用户列表
      route('account/list', 'routes/user/account/index.tsx'),
      route('session/list', 'routes/user/account/session.tsx'),
    ]),

    // 学生角色个人中心
    route('student', 'routes/student/main.tsx', [
      index('routes/student/index.tsx'),
      route('exam', 'routes/student/exam.tsx'),
      route('history', 'routes/student/history.tsx'),
      route('attempt', 'routes/student/attempt.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
