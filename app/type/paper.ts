import type { Content, QuestionInfoResp, QuestionOption } from "~/type/question";

/// 试卷相关的类型

// 添加精选试卷请求基础字段
export interface CommonPaperReq {
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
}

// 题型分组
export interface TopPaperGroupReq {
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
  questions: TopPaperQuestionReq[]; // 题目列表
}

// 题目详情
export interface TopPaperQuestionReq {
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

// 精选试卷添加请求
export interface TopPaperReq {
  common: CommonPaperReq;
  groups: TopPaperGroupReq[];
}

// 列表页面搜索属性
export interface CommonPaperSearchReq {
  source: string;
  relatedId: number; // 关联标识 考点或者章节等
  relatedName: string; // 关联标识名称
  selectedKeys: string[]; // 考点年级选择的key列表
  tag: string; // 标签
  year: string; // 年份
  grade: string; // 年级
  semester: string; // 学期
  paperType: number; // 试卷类型 1 精选试卷 2 手动组卷
  status?: number;
}

// 精选试卷返回
// 试卷返回基本信息字段
export interface CommonPaperResp {
  id: number; // 主键
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
  authorName: string; // 作者
  count: number; // 题目数量
  status: number; // 状态
  statusDesc: string; // 状态描述
  remarkExt: string; // 操作备注
  createdAt: string; // 创建时间
  updatedAt: string; // 更新时间
}

// 题型分组公共字段
export interface CommonPaperGroupResp {
  id: number;
  paperId: number; // 试卷标识
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
}

export interface TopPaperGroupResp {
  common: CommonPaperGroupResp;
  questions: TopPaperQuestionResp[];
}

// 题目详情
export interface TopPaperQuestionResp {
  id: number;
  paperId: number;
  groupId: number;
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

// 精选试卷详情返回
export interface TopPaperResp {
  common: CommonPaperResp;
  groups: TopPaperGroupResp[];
}

// 试卷列表请求
export interface PaperListReq {
  source: string;
  relatedId: number;
  tag?: string; // 标签
  year?: string; // 年份
  grade?: string; // 年级
  semester?: string; // 学期
  paperType?: number;
  status?: number;
  pageNo: number;
  pageSize: number;
}

// 试卷列表信息
export interface PaperListResp {
  list: CommonPaperResp[];
  pageNo: number;
  pageSize: number;
  total: number;
}

// 手动组卷
// 题型体量配置
export interface GenPaperGenType {
  id: number;
  label: string;
  num: number;
  score: number;
}

// 难度等级
export interface GenDifficultyLevelRange {
  basic: number; // 基础题百分比
  improve: number; // 提升题百分比
  expand: number; // 扩展题百分比
}

// 试卷题目
export interface GenPaperGenQuestionReq {
  genId: string;
  orderNum: number;
  questionId: number;
  score: number;
}

// 试卷生成配置
export interface CommonGenPaperGenConf {
  questionCateIds: number[];
  tagIds?: number[];
  dimensionIds?: number[];
  levelRange?: GenDifficultyLevelRange;
  questionTypes: GenPaperGenType[];
}

// 试卷题型列表
export interface GenPaperGroupReq {
  genId: string; // 前端生成的标识
  typeName: string; // 大题分类, 比如选择题等
  subTitle: string; // 题型说明, 比如本大题共8小题, 每题5分等
  questions: GenPaperGenQuestionReq[]; // 题目列表
}

// 手动组卷预览请求
export interface GenPaperPreviewReq {
  common: CommonPaperReq;
  conf: CommonGenPaperGenConf; // 试卷生成配置信息
}

// 手动组卷保存请求
export interface GenPaperReq {
  common: CommonPaperReq;
  conf: CommonGenPaperGenConf; // 试卷生成配置信息
  groups: GenPaperGroupReq[]; // 题型分组
}

// 组卷列表搜索字段维护
export interface GenPaperSearchReq {
  twoLevelId: number; // 第2层标识-用于查询题目类型和标签
  fiveLevelId: number; // 第5层标识-用于获取知识点分类和教材目录
  fiveLevelSelectKeys: string[]; // 选择的5层菜单导航key列表
  questionCateIds?: number[]; // 题目主键集合
  typeId?: number; // 题目类型
  tagIds?: number[]; // 题目标签
  dimensionIds?: number[]; //核心素养
  genPaperGenTypes: GenPaperGenType[]; // 题型题量配置
}

// 手动组卷试卷详情返回字段
export interface CommonPaperGenQuestionResp {
  id: number;
  paperId: number;
  groupId: number;
  genId: string;
  orderNum: number;
  questionId: number;
  score: number;
}

export interface GenPaperQuestionResp {
  common: CommonPaperGenQuestionResp;
  info: QuestionInfoResp; // 原始题目详情
}

export interface GenPaperGroupResp {
  common: CommonPaperGroupResp;
  questions: GenPaperQuestionResp[];
}

// 手动组卷详情返回结构
export interface GenPaperResp {
  common: CommonPaperResp;
  conf: CommonGenPaperGenConf;
  groups: GenPaperGroupResp[];
}

// 记录待替换的题目信息
export interface ReplaceQuestionReq {
  questionTypeId: number;
  groupId: number;
  index: number;
  questionId: number;
}

// 试卷搜索页面
export interface PaperPageSourceProps {
  source: "list" | "myPaper" | "myReview";
}

// 试卷审核
export interface PaperApproveReq {
  id: number;
  status: number; // 审核状态
  rejectReason: string; // 拒绝原因
}

// 试卷删除
export interface PaperDeleteReq {
  id: number;
}
