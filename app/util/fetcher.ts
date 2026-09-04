import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';
import { httpClient } from '~/util/http';
import type { Textbook, TextbookOtherDict } from '~/type/textbook';
import type { PaperListReq, PaperListResp, CommonPaperSearchReq, CommonPaperResp } from '~/type/paper';
import { StringConst, StringValidator } from '~/util/string';
import type { QuestionListReq, QuestionListResp, QuestionSearch, QuestionSimilarListReq } from '~/type/question';
import type { TaskListReq, TaskListResp } from '~/type/task';
import type { ChapterKnowledgeResp, QuestionCateResp } from '~/type/question-cate';
import type { ClassListReq, ClassListResp, ClassSearchReq, ClassStudentListReq, ClassStudentResp } from '~/type/class';
import type { UserIdentityListReq, UserIdentityListResp, UserSessionListReq, UserSessionListResp } from '~/type/user';
import type { HomeworkListSearchReq, HomeworkListResp, HomeworkListReq } from '~/type/homework';
import type { TestListReq, TestListResp } from '~/type/test';

/// 使用 SWR 缓存查询组件
/// https://swr.vercel.app/
/// 手动指定 key 时记得把请求路径加入到 key 中

// 默认的错误处理配置, 避免服务端未启动时频繁提示错误
const defaultErrConfig = {
  errorRetryCount: 2, // 最多重试2次
  errorRetryInterval: 10000, // 10秒间隔
  revalidateOnFocus: false, // 不聚焦时重新验证
  revalidateOnReconnect: false, // 不自动重连
};

// 导航-更新频率比较低, 只有强制刷新等才会重新请求
export function useTextbooks(depth: number = 5) {
  return useSWRImmutable<Textbook[]>(`/textbook/list/${depth}/all`, httpClient.get, defaultErrConfig);
}

// 最新精选试卷
export function useLatestPapers(paperType: number = StringConst.paperTypeTop, count: number = 6) {
  return useSWR<CommonPaperResp[]>(`/paper/latest/${paperType}/${count}`, httpClient.get, defaultErrConfig);
}

// 试卷列表
export function usePaperList(search: CommonPaperSearchReq, pageNo: number) {
  const req: PaperListReq = {
    source: search.source,
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
  if (StringValidator.isNonEmpty(search.grade) && search.grade !== '不选') {
    req.grade = search.grade;
  }
  if (StringValidator.isNonEmpty(search.semester) && search.semester !== '不选') {
    req.semester = search.semester;
  }
  if (search.status !== undefined) {
    req.status = search.status;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const reqPath = '/paper/list';
  const key = req.relatedId > 0 ? [reqPath, JSON.stringify(req)] : null;

  return useSWR<PaperListResp>(key, () => httpClient.post<PaperListResp>(reqPath, req), defaultErrConfig);
}

// 教材/考点题型列表-第5层标识同时获取题型列表
export function useQuestionCates(fiveLevelId: number) {
  const key = fiveLevelId > 0 ? `/textbook/list/${fiveLevelId}/children` : null;
  return useSWR<Textbook[]>(key, httpClient.get, defaultErrConfig);
}

// 题目列表
export function useQuestionList(source: string, search: QuestionSearch, pageNo: number) {
  const req: QuestionListReq = {
    source,
    questionCateIds: search.eightIds,
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
  const reqPath = '/question/list';
  const key = req.questionCateIds.length > 0 ? [reqPath, JSON.stringify(req)] : null;
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>(reqPath, req), defaultErrConfig);
}

// 变式题列表, 只展示题干, 不展示详情, 因为变式题本身在列表题目中
export function useSimilarList(questionId: number, eightId: number, pageNo: number) {
  const req: QuestionSimilarListReq = {
    questionId: questionId,
    questionCateId: eightId,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };

  const reqPath = '/question/similar';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>(reqPath, req), defaultErrConfig);
}

// 题目上传任务列表
export function useTaskList(req: TaskListReq) {
  return useSWR<TaskListResp>(JSON.stringify(req), () => httpClient.post<TaskListResp>('/task/list', req), defaultErrConfig);
}

// 题目其它通用字典获取
export function useQuestionOtherDicts(twoLevelId: number, typeCode: string) {
  const key = twoLevelId > 0 && StringValidator.isNonEmpty(typeCode) ? `/other/dict/list/${twoLevelId}/${typeCode}` : null;
  return useSWRImmutable<TextbookOtherDict[]>(key, httpClient.get, defaultErrConfig);
}

// 用户中心导航菜单维护 - 获取指定深度的父级标识获取子菜单列表
export function useTextbookLevel(parentId: number = 0) {
  const key = parentId > 0 ? `/textbook/list/${parentId}/level` : null;
  return useSWRImmutable<Textbook[]>(key, httpClient.get, defaultErrConfig);
}

// 通过章节或者考点拉去关联关系
export function useChapterKnowledgeList(sevenLevelId: number) {
  const key = sevenLevelId > 0 ? `/chapter-knowledge/list/${sevenLevelId}` : null;
  return useSWR<ChapterKnowledgeResp[]>(key, httpClient.get, defaultErrConfig);
}

// 获取题型列表
export function useQuestionCateList(relatedId: number) {
  const key = relatedId > 0 ? `/question-cate/list/${relatedId}` : null;
  return useSWR<QuestionCateResp[]>(key, httpClient.get, defaultErrConfig);
}

// 班级列表
export function useClassList(search: ClassSearchReq, pageNo: number) {
  let req: ClassListReq = {
    pageNo,
    pageSize: StringConst.pageSize,
  };

  if (StringValidator.isNonEmpty(search.year)) {
    req.year = search.year;
  }
  if (StringValidator.isNonEmpty(search.grade)) {
    req.grade = search.grade;
  }
  if (StringValidator.isNonEmpty(search.semester)) {
    req.semester = search.semester;
  }

  const reqPath = '/class/list';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<ClassListResp>(key, () => httpClient.post<ClassListResp>(reqPath, req), defaultErrConfig);
}

// 班级学生账户列表
// 使用全局缓存key, 方便跨组件重新 mutate 该数据, 尤其针对不直接关联的兄弟组件
export const getClassStudentListKey = (classIds: number[]) => {
  const reqPath = '/class/student/list';
  // 排序避免顺序不一致
  const sortedIds = [...classIds].sort((a, b) => a - b);
  return [reqPath, JSON.stringify({ sortedIds })];
};

export function useClassStudentList(classIds: number[]) {
  const req: ClassStudentListReq = {
    classIds,
  };
  const reqPath = '/class/student/list';
  const key = getClassStudentListKey(classIds);
  return useSWR<Record<number, ClassStudentResp[]>>(key, () => httpClient.post<Record<number, ClassStudentResp[]>>(reqPath, req), defaultErrConfig);
}

// 第三方登录用户列表
export function useUserAccountList(pageNo: number) {
  let req: UserIdentityListReq = {
    pageNo,
    pageSize: StringConst.pageSize,
  };

  const reqPath = '/user/account/list';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<UserIdentityListResp>(key, () => httpClient.post<UserIdentityListResp>(reqPath, req), defaultErrConfig);
}

// 用户 Session 列表
export function useUserSessionList(pageNo: number) {
  let req: UserSessionListReq = {
    pageNo,
    pageSize: StringConst.pageSize,
  };

  const reqPath = '/user/session/list';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<UserSessionListResp>(key, () => httpClient.post<UserSessionListResp>(reqPath, req), defaultErrConfig);
}

// 作业布置列表
export function usePaperHomeworkList(search: HomeworkListSearchReq, pageNo: number) {
  let req: HomeworkListReq = {
    paperId: search.paperId,
    pageNo,
    pageSize: StringConst.pageSize,
  };
  if (search.batchNo && search.batchNo > 0) {
    req.batchNo = search.batchNo;
  }

  const reqPath = '/homework/list';
  const key = req.paperId > 0 ? [reqPath, JSON.stringify(req)] : null;
  return useSWR<HomeworkListResp>(key, () => httpClient.post<HomeworkListResp>(reqPath, req), defaultErrConfig);
}

// 学生任务列表
export function useTestList(startDate: string, endDate: string, pageNo: number) {
  let req: TestListReq = {
    startDate,
    endDate,
    pageNo,
    pageSize: StringConst.pageSize,
  };

  const reqPath = '/test/list';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<TestListResp>(key, () => httpClient.post<TestListResp>(reqPath, req), defaultErrConfig);
}
