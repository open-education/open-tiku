// 用户角色
export enum UserRoleType {
  None = 0, // 无
  Normal = 1, // 普通
  Student = 2, // 学生
  Teacher = 3, // 教师
}

// 题目状态枚举定义
export enum QuestionStatus {
  Drafing = 0, // 草稿中
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
