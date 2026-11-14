import { AccountStatus, QuestionStatus, StudentStatus } from '@/type/enum';

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

  // 题目难度系数配置
  difficultyLevelList: [
    { value: 1, label: '1' },
    { value: 1.5, label: '1.5' },
    { value: 2, label: '2' },
    { value: 2.5, label: '2.5' },
    { value: 3, label: '3' },
    { value: 3.5, label: '3.5' },
    { value: 4, label: '4' },
    { value: 4.5, label: '4.5' },
    { value: 5.0, label: '5' },
  ],
  // 选项布局
  selectLayoutList: [
    { id: 'select_layout_list_1', value: 1, label: '展示一列' },
    { id: 'select_layout_list_2', value: 2, label: '展示两列' },
    { id: 'select_layout_list_3', value: 3, label: '展示四列' },
  ],
  // 第三方账户状态
  accountStatusList: [
    { id: 1, value: AccountStatus.Active, label: '激活' },
    { id: 2, value: AccountStatus.Paused, label: '暂停' },
    { id: 20, value: AccountStatus.Forbidden, label: '封禁' },
  ],
  // 题目类型列表
  questionOtherDictList: [
    { id: 1, value: 'question_type', label: '题型' },
    { id: 2, value: 'question_tag', label: '标签' },
    { id: 3, value: 'question_dimension', label: '核心素养' },
    { id: 4, value: 'question_level', label: '分层体系' },
    { id: 5, value: 'question_scene', label: '适用场景' },
    { id: 6, value: 'question_mistake_tip', label: '常见错误' },
  ],
  questionOtherDictNames: new Map<string, string>([
    ['question_type', '题型'],
    ['question_tag', '标签'],
    ['question_dimension', '核心素养'],
    ['question_level', '分层体系'],
    ['question_scene', '适用场景'],
    ['question_mistake_tip', '常见错误'],
  ]),
  // 菜单路径类型
  textbookPathTypes: [
    { id: 1, value: 'common', label: '公共' },
    { id: 2, value: 'chapter', label: '章节' },
    { id: 3, value: 'knowledge', label: '考点' },
  ],
  // 菜单路径名称
  textbookPathTypeNames: new Map<string, string>([
    ['common', '公共'],
    ['chapter', '章节'],
    ['knowledge', '考点'],
  ]),
  // 任务类型是上传题目
  taskTypeUploadQuestion: 1,
  // 学生账户状态
  studentStatusList: [
    { id: 1, value: StudentStatus.Active, label: '激活' },
    { id: 2, value: StudentStatus.Pause, label: '暂停' },
    { id: 3, value: StudentStatus.Disabled, label: '停用' },
  ],
};

// 字符串验证工具类
export const StringValidator = {
  // 检查是否为非空字符串
  isNonEmpty: (str: any): str is string => typeof str === 'string' && str.length > 0,
};
