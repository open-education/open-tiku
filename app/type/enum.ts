// 用户角色
export enum UserRoleType {
  None = 0, // 无
  Normal = 1, // 普通
  Student = 2, // 学生
  Teacher = 3, // 教师
}

// 题目状态枚举定义
export enum QuestionStatus {
  None = -1, // 无状态
  Drafting = 0, // 草稿中
  Pending = 1, // 待审核
  Published = 2, // 已发布
  Rejected = 3, // 已拒绝
}

// 题目关系
export enum QuestionRelationType {
  Similar = 1, // 变式题
  Original = 2, // 课本原题
  Base = 3, // 母题
}

// 用户登录来源
export enum UserLoginSource {
  User = 1, // 普通用户
  Student = 2, // 学生
}

// 题库页面来源
export enum QuestionPageSource {
  /** 普通的搜索列表 */
  List = 'list',
  /** 我的题目：只有查看和编辑 */
  MyQuestion = 'myQuestion',
  /** 我的审核：只有查看 */
  MyReview = 'myReview',
}

// 试卷页面来源
export enum PaperPageSource {
  /** 普通的搜索列表 */
  List = 'list',
  /** 我的试卷：只有查看和编辑 */
  MyPaper = 'myPaper',
  /** 我的审核：只有查看 */
  MyReview = 'myReview',
}

// 第三方登录账号状态
export enum AccountStatus {
  Active = 1, // 1 激活
  Paused = 2, // 2 暂停
  Forbidden = 20, // 20 封禁
}

// 学生账户状态
export enum StudentStatus {
  Active = 1, // 激活
  Pause = 2, // 暂停
  Disabled = 3, // 禁用
}

// 个性化配置
export enum CustomType {
  Textbook = 1, // 定制教材层级菜单
}

// 文件类型列表
export enum UploadFileType {
  None = 0, // 无意义
  Pdf = 1, // PDF 文件
  Word = 2, // Word 文件
  Image = 3, // 图片
  Markdown = 4, // Markdown 文档
}

// 考试类型
export enum ExamType {
  UnitTest = 1, // 单元测试
  Midterm = 2, // 期中考试
  Final = 3, // 期末考试
  ZhongkaoMock = 4, // 中考模拟
  MonthlyExam = 5, // 月考
  TopicPaper = 6, // 专题卷
}

// 级别类型
export enum PaperLevelType {
  Standard = 1, // 普通
  Premium = 2, // 精品
}

// 难度类型
export enum PaperDifficultyType {
  Easy = 1, // 容易
  Medium = 2, // 适中
  Hard = 3, // 困难
}

// 个性化用户来源
export enum CustomUserSource {
  Person = 1, // 个人
  System = 2, // 系统
}

// 个性化页面来源
export enum CustomPageSource {
  Default = 1, // 默认, 非登录用户获取系统默认配置, 登录用户没有配置则获取系统默认配置
  My = 2, // 我的个性化, 只获取我的个性化配置
}

// 填充默认菜单类型
export enum TextbookFillLevelType {
  Five = 1, // 前5层
  Eight = 2, // 后3层
}

// 题目编辑类型
export enum QuestionEditMode {
  Edit = 1, // 编辑
  AddSimilar = 2, // 添加变式题
}

// 试卷类型
export enum PaperType {
  Upload = 1, // 上传试卷
  Manual = 2, // 手动组卷
}

// 试卷状态枚举定义
export enum PaperStatus {
  None = -1, // 无状态
  Drafting = 1, // 草稿中
  Pending = 2, // 待审核
  Published = 3, // 已发布
  Rejected = 10, // 已拒绝
}
