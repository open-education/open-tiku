// 题型
export interface QuestionCateResp {
  id: number;
  relatedId: number;
  label: string;
  key: string;
  sortOrder: number;
}

// 创建和编辑题型
export interface CreateQuestionCateReq {
  id?: number;
  relatedId: number;
  label: string;
  sortOrder: number;
}

// 获取章节/考点列表
export interface ChapterKnowledgeIdsReq {
  ids: number[];
}

// 解除关联关系
export interface RemoveChapterKnowledgeReq {
  chapterId: number;
  knowledgeId: number;
}
