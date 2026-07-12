/// 试卷相关的类型

import type { Content, QuestionOption } from "~/type/question";

// 试卷主要信息
export interface PaperTopMeta {
  id?: number; // 主键, 新增时不能传递该key
  relatedId: number; // 关联标识 考点或者章节等
  relatedName: string; // 关联标识名称
  tag: string; // 标签
  year: string; // 年份
  grade: string; // 年级
  semester: string; // 学期
  title: string; // 标题
  score: number; // 分数
  source: string; // 来源
  remark: string; // 试卷备注
  authorId: number; // 作者标识
  authorName: string; // 作者名称
  groups: PaperTopGroup[]; // 包含的题目
  count: number; // 题目数量
  status: number; // 状态
  statusDesc: string; // 状态描述
  remarkExt: string; // 操作备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 题型分组
export interface PaperTopGroup {
  id: number;
  paperId: number; // 试卷标识
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
  questions: PaperTopQuestion[]; // 题目列表
}

// 题目详情
export interface PaperTopQuestion {
  id: number;
  paperId: number; // 试卷标识
  groupId: number; // 分组标识
  genId: string; // 前端生成的标识
  orderNum: number; // 小题序号
  stem: string; // 题干
  images?: string[]; // 图片
  optionsLayout?: number; // 选项布局
  options?: QuestionOption[]; // 选项
  answer: string; // 答案
  analysis: Content; // 分析
  score: number; // 分数
}

// 列表页面搜索属性
export interface PaperTopMetaSearch {
  relatedId: number; // 关联标识 考点或者章节等
  relatedName: string; // 关联标识名称
  selectedKeys: string[]; // 考点年级选择的key列表
  tag: string; // 标签
  year: string; // 年份
  grade: string; // 年级
  semester: string; // 学期
}

// 试卷列表请求
export interface PaperTopListReq {
  relatedId: number;
  tag?: string; // 标签
  year?: string; // 年份
  grade?: string; // 年级
  semester?: string; // 学期
  pageNo: number;
  pageSize: number;
}

// 试卷列表信息
export interface PaperTopListResp {
  list: PaperTopMeta[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 组卷列表搜索字段维护
export interface PaperGenSearch {
  twoLevelId: number; // 第2层标识-用于查询题目类型和标签
  fiveLevelId: number; // 第5层标识-用于获取知识点分类和教材目录
  fiveLevelSelectKeys: string[]; // 选择的5层菜单导航key列表
  typeId?: number; // 题目类型
  tagIds?: number[]; // 题目标签
  dimensionIds?: number[]; //核心素养
}

// 题型体量配置
export interface PaperGenMeta {
  id: number;
  label: string;
  num: number;
  score: number;
}

// 难度等级
export interface DifficultyLevelRange {
  basic: number;
  improve: number;
  expand: number;
}
