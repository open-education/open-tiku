// 题目状态枚举定义
export enum QuestionStatus {
  Drafing = 0, // 草稿中
  Pending = 1, // 待审核
  Published = 2, // 已发布
  Rejected = 3, // 已拒绝
}

// 试卷状态枚举定义
export enum PaperStatus {
  Drafing = 1, // 草稿中
  Pending = 2, // 待审核
  Published = 3, // 已发布
  Homework = 4, // 已布置作业
  Rejected = 10, // 已拒绝
}

// 学生账户状态
export enum StudentStatus {
  Active = 1, // 激活
  Pause = 2, // 暂停
  Disabled = 3, // 禁用
}

// 用户角色
export enum UserRoleType {
  Normal = 1, // 普通
  Student = 2, // 学生
  Teacher = 3, // 教师
}

// 用户登录来源
export enum UserLoginSource {
  User = 1, // 普通用户
  Student = 2, // 学生
}

// 题目关系
export enum QuestionRelationType {
  Similar = 1, // 变式题
  Original = 2, // 课本原题
  Base = 3, // 母题
}

// 第三方登录账号状态
export enum AccountStatus {
  Active = 1, // 1 激活
  Paused = 2, // 2 暂停
  Forbidden = 20, // 20 封禁
}

// 做题模式
export enum TestMethod {
  Exercise = 1, // 练习模式
  Exam = 2, // 考试模式
}

// 答案判断
export enum TestResult {
  Unanswered = 0, // 未作答
  Correct = 1, // 正确
  Incorrect = 2, // 错误
}

// 提交做题记录
export enum TestStatus {
  InProgress = 1, // 保存草稿
  Done = 2, // 完成
}
