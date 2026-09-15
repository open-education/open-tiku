// 最新题目
export interface LatestQuestionResp {
  id: number;
  questionCateId: number;
  title: string;
  createdAt: string;
  timeDesc: string;
}

// 网站统计
export interface CountInfo {
  textbookNum: number;
  questionNum: number;
  paperNum: number;
  teacherNum: number;
  studentNum: number;
}

// 活跃教师
export interface AuthorQuestionResp {
  authorId: number;
  authorName: string;
  cnt: number;
}

// 热门教材
export interface TopTextbookResp {
  textbookId: number;
  cnt: number;
}

export interface BoardResp {
  countInfo: CountInfo;
  latestQuestions: LatestQuestionResp[];
  topTeacherQuestions: AuthorQuestionResp[];
  topTextbooks: TopTextbookResp[];
}
