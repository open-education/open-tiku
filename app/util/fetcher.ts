import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { httpClient } from "~/util/http";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import type { PaperListReq, PaperListResp, PaperMeta, PaperMetaSearch } from "~/type/paper";
import { StringConst, StringValidator } from "~/util/string";
import type { QuestionListReq, QuestionListResp, QuestionSearch, QuestionSimilarListReq } from "~/type/question";

/// 使用 SWR 缓存查询组件
/// https://swr.vercel.app/

// 导航-更新频率比较低, 只有强制刷新等才会重新请求
export function useTextbooks(depth: number = 5) {
  return useSWRImmutable<Textbook[]>(`/textbook/list/${depth}/all`, httpClient.get);
}

// 最新试卷
export function useLatestPapers(count: number = 6) {
  return useSWRImmutable<PaperMeta[]>(`/paper/latest/${count}`, httpClient.get);
}

// 试卷列表
export function usePaperList(search: PaperMetaSearch, pageNo: number) {
  const req: PaperListReq = {
    relatedId: search.relatedId,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };
  if (StringValidator.isNonEmpty(search.tag)) {
    req.tag = search.tag;
  }
  if (StringValidator.isNonEmpty(search.year)) {
    req.year = search.year;
  }
  if (StringValidator.isNonEmpty(search.grade) && search.grade !== "不选") {
    req.grade = search.grade;
  }
  if (StringValidator.isNonEmpty(search.semester) && search.semester !== "不选") {
    req.semester = search.semester;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const key = req.relatedId > 0 ? JSON.stringify(req) : null;

  return useSWR(key, () => httpClient.post<PaperListResp>("/paper/list", req), {
    keepPreviousData: true, // 分页切换时保留旧数据，体验更好
  });
}

// 教材/考点题型列表-第5层标识
export function useQuestionCates(fiveLevelId: number) {
  const key = fiveLevelId > 0 ? `/textbook/list/${fiveLevelId}/children` : null;
  return useSWRImmutable<Textbook[]>(key, httpClient.get);
}

// 题目类型列表-第2层标识
export function useQuestionTypes(twoLevelId: number) {
  const key = twoLevelId > 0 ? `/other/dict/list/${twoLevelId}/question_type` : null;
  return useSWRImmutable<TextbookOtherDict[]>(key, httpClient.get);
}

// 题目标签列表-第2层标识
export function useQuestionTags(twoLevelId: number) {
  const key = twoLevelId > 0 ? `/other/dict/list/${twoLevelId}/question_tag` : null;
  return useSWRImmutable<TextbookOtherDict[]>(key, httpClient.get);
}

// 题目列表
export function useQuestionList(search: QuestionSearch, pageNo: number) {
  const req: QuestionListReq = {
    questionCateId: search.eightId,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };
  if (search.typeId > 0) {
    req.questionTypeId = search.typeId;
  }
  if (search.tagIds && search.tagIds.length > 0) {
    req.tagIds = search.tagIds;
  }
  if (search.id > 0) {
    req.ids = [search.id];
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const key = req.questionCateId > 0 ? JSON.stringify(req) : null;
  return useSWR(key, () => httpClient.post<QuestionListResp>("/question/list", req), {
    keepPreviousData: true, // 分页切换时保留旧数据，体验更好
  });
}

// 变式题列表, 只展示题干, 不展示详情, 因为变式题本身在列表题目中
export function useSimilarList(questionId: number, eightId: number, pageNo: number) {
  const req: QuestionSimilarListReq = {
    questionId: questionId,
    questionCateId: eightId,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };

  return useSWR({ url: "/question/similar", data: req }, ({ url, data }) => httpClient.post(url, data));
}
