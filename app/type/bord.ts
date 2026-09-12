export interface LatestQuestionResp {
  id: number;
  questionCateId: number;
  title: string;
  createdAt: string;
  timeDesc: string;
}

export interface BoardResp {
  latestQuestions: LatestQuestionResp[];
}
