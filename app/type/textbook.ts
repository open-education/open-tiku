// 教材章节字典相关属性
export interface TextbookResp {
  id: number;
  parentId: number;
  label: string;
  key: string;
  pathType: string;
  sortOrder: number;
  pathDepth: number;
  path: string;
  tableName?: string;
  children?: TextbookResp[];
}

// 通用字典返回
export interface TextbookOtherDictListReq {
  textbookId: number;
  codes?: string[];
}

// 教材章节其它字典
export interface TextbookOtherDictResp {
  id: number;
  textbookId: number;
  typeCode: string;
  itemValue: string;
  sortOrder: number;
  isSelect: boolean;
}

export interface TextbookOtherDictListResp {
  map: Record<string, TextbookOtherDictResp[]>;
}

// 统一记录其它字典信息便于传递
export interface OtherDictListRecord {
  questionTypes: TextbookOtherDictResp[];
  questionTypeDict: Record<number, TextbookOtherDictResp>;

  questionTags: TextbookOtherDictResp[];
  questionTagDict: Record<number, TextbookOtherDictResp>;

  questionDimensions: TextbookOtherDictResp[];
  questionDimensionDict: Record<number, TextbookOtherDictResp>;

  questionLevels: TextbookOtherDictResp[];
  questionLevelDict: Record<number, TextbookOtherDictResp>;

  questionScenes: TextbookOtherDictResp[];
  questionSceneDict: Record<number, TextbookOtherDictResp>;

  questionMistakeTips: TextbookOtherDictResp[];
  questionMistakeTipDict: Record<number, TextbookOtherDictResp>;
}
