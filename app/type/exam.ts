/// 试卷相关的类型

import type { QuestionOption } from "~/type/question";

// 试卷主要信息
export interface PaperMeta {
  id: number; // 主键
  relatedId: number; // 关联标识 考点或者章节等
  relatedName?: string; // 关联标识名称
  tag: string; // 标签
  year: string; // 年份
  grade?: string; // 年级
  semester?: string; // 学期
  title: string; // 标题
  score: number; // 分数
  source: string; // 来源
  remark?: string; // 试卷备注
  authorId?: number; // 作者标识
  authorName?: string; // 作者名称
  groups: Group[]; // 包含的题目
  count?: number; // 题目数量
  status: number; // 状态
  statusDesc?: string; // 状态描述
  remarkExt?: string; // 操作备注
  createAt: string; // 创建时间
  updateAt: string; // 更新时间
}

// 题型分组
export interface Group {
  id: number;
  paperId: number; // 试卷标识
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
  questions: QuestionInfo[]; // 题目列表
}

// 题目详情
export interface QuestionInfo {
  id: number;
  groupId: number; // 分组标识
  genId: string; // 前端生成的标识
  order: number;
  stem: string; // 题干
  images?: string[]; // 图片
  options: QuestionOption[]; // 选项
  answer: string; // 答案
  analysis: string; // 分析
  score: number; // 分数
}
