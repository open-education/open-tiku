import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { httpClient } from "~/util/http";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import type { PaperListReq, PaperListResp, PaperMeta, PaperMetaSearch } from "~/type/paper";
import { StringConst, StringValidator } from "~/util/string";
import type { QuestionListReq, QuestionListResp, QuestionSearch, QuestionSimilarListReq } from "~/type/question";
import type { TaskListReq, TaskListResp } from "~/type/task";
import type { ChapterKnowledgeResp, QuestionCateResp } from "~/type/question-cate";

/// 使用 SWR 缓存查询组件
/// https://swr.vercel.app/

// 导航-更新频率比较低, 只有强制刷新等才会重新请求
export function useTextbooks(depth: number = 5) {
  return useSWRImmutable<Textbook[]>(`/textbook/list/${depth}/all`, httpClient.get, {
    errorRetryCount: 2, // 最多重试2次
    errorRetryInterval: 10000, // 10秒间隔
    revalidateOnFocus: false, // 不聚焦时重新验证
    revalidateOnReconnect: false, // 不自动重连
  });
}

// 最新试卷
export function useLatestPapers(count: number = 6) {
  return useSWRImmutable<PaperMeta[]>(`/paper/latest/${count}`, httpClient.get, {
    errorRetryCount: 2, // 最多重试2次
    errorRetryInterval: 10000, // 10秒间隔
    revalidateOnFocus: false, // 不聚焦时重新验证
    revalidateOnReconnect: false, // 不自动重连
  });
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
  if (search.paperType > 0) {
    req.paperType = search.paperType;
  }
  if (StringValidator.isNonEmpty(search.grade) && search.grade !== "不选") {
    req.grade = search.grade;
  }
  if (StringValidator.isNonEmpty(search.semester) && search.semester !== "不选") {
    req.semester = search.semester;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const key = req.relatedId > 0 ? JSON.stringify(req) : null;

  return useSWR<PaperListResp>(key, () => httpClient.post<PaperListResp>("/paper/list", req), {
    keepPreviousData: true, // 分页切换时保留旧数据，体验更好
  });
}

// 教材/考点题型列表-第5层标识同时获取题型列表
export function useQuestionCates(fiveLevelId: number) {
  const key = fiveLevelId > 0 ? `/textbook/list/${fiveLevelId}/children` : null;
  return useSWRImmutable<Textbook[]>(key, httpClient.get);
}

// 题目列表
export function useQuestionList(source: string, search: QuestionSearch, pageNo: number) {
  const req: QuestionListReq = {
    source,
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
  if (search.id && search.id > 0) {
    req.ids = [search.id];
  }
  if (search.status !== undefined) {
    req.status = search.status;
  }
  if (search.dimensionIds && search.dimensionIds.length > 0) {
    req.dimensionIds = search.dimensionIds;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const key = req.questionCateId > 0 ? JSON.stringify(req) : null;
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>("/question/list", req), {
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

  const key = JSON.stringify(req);
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>("/question/similar", req));
}

// 题目上传任务列表
export function useTaskList(req: TaskListReq) {
  return useSWR<TaskListResp>(JSON.stringify(req), () => httpClient.post<TaskListResp>("/task/list", req));
}

// 题目其它通用字典获取
export function useQuestionOtherDicts(twoLevelId: number, typeCode: string) {
  const key = twoLevelId > 0 && StringValidator.isNonEmpty(typeCode) ? `/other/dict/list/${twoLevelId}/${typeCode}` : null;
  return useSWRImmutable<TextbookOtherDict[]>(key, httpClient.get);
}

// 用户中心导航菜单维护 - 获取指定深度的父级标识获取子菜单列表
export function useTextbookLevel(parentId: number = 0) {
  const key = parentId > 0 ? `/textbook/list/${parentId}/level` : null;
  return useSWRImmutable<Textbook[]>(key, httpClient.get);
}

// 通过章节或者考点拉去关联关系
export function useChapterKnowledgeList(sevenLevelId: number) {
  const key = sevenLevelId > 0 ? `/chapter-knowledge/list/${sevenLevelId}` : null;
  return useSWRImmutable<ChapterKnowledgeResp[]>(key, httpClient.get);
}

// 获取题型列表
export function useQuestionCateList(relatedId: number) {
  const key = relatedId > 0 ? `/question-cate/list/${relatedId}` : null;
  return useSWRImmutable<QuestionCateResp[]>(key, httpClient.get);
}
