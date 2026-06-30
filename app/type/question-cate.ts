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

// 创建关联关系
export interface CreateChapterKnowledgeReq {
  chapterId: number;
  knowledgeId: number;
}

// 解除关联关系
export interface RemoveChapterKnowledgeReq {
  chapterId: number;
  knowledgeId: number;
}

// 关联关系
export interface ChapterKnowledgeResp {
  id: number;
  chapterId: number;
  knowledgeId: number;
}
