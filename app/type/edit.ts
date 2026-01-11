import type {Content, QuestionOption} from "~/type/question";

export interface EditQuestionType {
  id: number,
  questionType: number,
}

export interface EditQuestionTags {
  id: number,
  tags: number[],
}

export interface EditRate {
  id: number,
  difficultyLevel: number,
}

export interface EditSelect {
  id: number,
  layout: number,
}

export interface EditTitle {
  id: number,
  title: string,
}

export interface EditMention {
  id: number,
  mention: string,
}

export interface EditOption {
  id: number,
  option: QuestionOption,
}

export interface EditAnswer {
  id: number,
  answer: string,
}

export interface EditKnowledge {
  id: number,
  knowledge: string,
}

export interface EditAnalyze {
  id: number,
  analyze: Content,
}

export interface EditProcess {
  id: number,
  process: Content,
}

export interface EditRemark {
  id: number,
  remark: string,
}
