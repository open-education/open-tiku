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
