export interface Item {
  id: number;
  label: string;
  num: number;
  score: number;
  scores?: number[];
}

// 组卷规则
export interface Rule {
  id: number;
  value: string;
  label: string;
  list?: Item[];
}

// 监控组卷选中的题目
export interface SelectQuestionIds {
  currentIds: number[];
  sortedIds: number[];
}
