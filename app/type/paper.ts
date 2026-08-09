/// 试卷相关的类型

import type { Content, QuestionOption } from "~/type/question";

// 试卷基本信息字段
export interface PaperCommonMeta {
  id?: number; // 主键, 新增时不能传递该key
  relatedId: number; // 关联标识 考点或者章节等
  relatedName: string; // 关联标识名称
  paperType: number; // 试卷类型 1精选试卷 2手动组卷
  tag: string; // 标签
  year: string; // 年份
  grade: string; // 年级
  semester: string; // 学期
  title: string; // 标题
  score: number; // 分数
  source: string; // 来源
  remark: string; // 试卷备注
  authorName?: string; // 作者
  count: number; // 题目数量
  status: number; // 状态
  statusDesc: string; // 状态描述
  remarkExt: string; // 操作备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 试卷主要信息
export interface PaperMeta extends PaperCommonMeta {
  groups: PaperGroup[]; // 包含的题目
}

// 题型分组公共字段
export interface PaperGroupCommon {
  id: number;
  paperId: number; // 试卷标识
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
}

// 题型分组
export interface PaperGroup extends PaperGroupCommon {
  questions: PaperQuestion[]; // 题目列表
}

// 题目详情
export interface PaperQuestion {
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
export interface PaperMetaSearch {
  relatedId: number; // 关联标识 考点或者章节等
  relatedName: string; // 关联标识名称
  selectedKeys: string[]; // 考点年级选择的key列表
  tag: string; // 标签
  year: string; // 年份
  grade: string; // 年级
  semester: string; // 学期
  paperType: number; // 试卷类型 1 精选试卷 2 手动组卷
}

// 试卷列表请求
export interface PaperListReq {
  relatedId: number;
  tag?: string; // 标签
  year?: string; // 年份
  grade?: string; // 年级
  semester?: string; // 学期
  paperType?: number;
  pageNo: number;
  pageSize: number;
}

// 试卷列表信息
export interface PaperListResp {
  list: PaperMeta[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 组卷列表搜索字段维护
export interface PaperGenSearch {
  twoLevelId: number; // 第2层标识-用于查询题目类型和标签
  fiveLevelId: number; // 第5层标识-用于获取知识点分类和教材目录
  fiveLevelSelectKeys: string[]; // 选择的5层菜单导航key列表
  questionCateIds?: number[]; // 题目主键集合
  typeId?: number; // 题目类型
  tagIds?: number[]; // 题目标签
  dimensionIds?: number[]; //核心素养
  typeMetaList: PaperGenTypeMeta[]; // 题型题量配置
}

// 题型体量配置
export interface PaperGenTypeMeta {
  id: number;
  label: string;
  num: number;
  score: number;
}

// 难度等级
export interface DifficultyLevelRange {
  basic: number; // 基础题百分比
  improve: number; // 提升题百分比
  expand: number; // 扩展题百分比
}

// 试卷生成配置
export interface PapgerGenConf {
  questionCateIds: number[];
  tagIds?: number[];
  dimensionIds?: number[];
  levelRange?: DifficultyLevelRange;
  questionTypes: PaperGenTypeMeta[];
}

// 手动组卷预览请求
export interface PaperPreviewReq extends PaperCommonMeta {
  conf: PapgerGenConf; // 试卷生成配置信息
}

// 试卷题目
export interface PaperGenQuestionReq {
  genId: string;
  orderNum: number;
  questionId: number;
  score: number;
}

// 试卷题型列表
export interface PaperGenGroupReq extends PaperGroupCommon {
  questions: PaperGenQuestionReq[]; // 题目列表
}

// 手动组卷保存请求
export interface PaperGenReq extends PaperCommonMeta {
  conf: PapgerGenConf; // 试卷生成配置信息
  groups: PaperGenGroupReq[]; // 题型分组
}
