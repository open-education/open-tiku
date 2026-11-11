import { QuestionStatus } from '@/type/enum';

// 部分字符串常量维护
export const StringConst = {
  questionCateTableName: 'question_cate', // 题型表
  dictPath: '_cate', // 面包屑字典路径

  // 每页显示数据条数
  pageSize: 10,

  // 题目审核状态
  questionStatusList: [
    { id: 1, value: QuestionStatus.Drafing, label: '草稿中' },
    { id: 2, value: QuestionStatus.Pending, label: '待审核' },
    { id: 3, value: QuestionStatus.Published, label: '已发布' },
    { id: 4, value: QuestionStatus.Rejected, label: '已拒绝' },
  ],

  // 查看变式题列表时需要忽略的分层体系
  ignoreQuestionLevelItems: ['母题', '其它'],

  // 服务邮箱
  defaultServEmail: 'tiku@oniqi.com',
  defaultServEmailTitle: 'OpenTiku',
};

// 字符串验证工具类
export const StringValidator = {
  // 检查是否为非空字符串
  isNonEmpty: (str: any): str is string => typeof str === 'string' && str.length > 0,
};
