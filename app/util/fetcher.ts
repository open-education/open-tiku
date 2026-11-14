import type { BoardResp } from '@/type/bord';
import type { ClassListReq, ClassListResp, ClassSearchReq, ClassStudentListReq, ClassStudentResp } from '@/type/class';
import { QuestionPageSource } from '@/type/enum';
import type { QuestionListReq, QuestionListResp, QuestionSearch } from '@/type/question';
import type { ChapterKnowledgeResp, QuestionCateResp } from '@/type/question-cate';
import type { TaskListReq, TaskListResp } from '@/type/task';
import type { TextbookOtherDictListReq, TextbookOtherDictListResp, TextbookOtherDictResp, TextbookResp } from '@/type/textbook';
import type { UserIdentityListReq, UserIdentityListResp, UserSessionListReq, UserSessionListResp } from '@/type/user';
import { httpClient } from '@/util/http';
import { StringConst, StringValidator } from '@/util/string';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

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
  return useSWRImmutable<TextbookResp[]>(`/textbook/list/${depth}/all`, httpClient.get, defaultErrConfig);
}

// 通过教材标识和字典获取字典信息
export function useQuestionOtherDictList(twoLevelId: number, typeCodes: string[]) {
  let req: TextbookOtherDictListReq = {
    textbookId: twoLevelId,
  };
  if (typeCodes.length > 0) {
    req.codes = typeCodes;
  }

  const reqPath = '/other/dict/list/all';
  const key = twoLevelId > 0 ? [reqPath, JSON.stringify(req)] : null;
  return useSWRImmutable<TextbookOtherDictListResp>(key, () => httpClient.post<TextbookOtherDictListResp>(reqPath, req), defaultErrConfig);
}

// 教材/考点题型列表-第5层标识同时获取题型列表
export function useQuestionCates(fiveLevelId: number) {
  const key = fiveLevelId > 0 ? `/textbook/list/${fiveLevelId}/children` : null;
  return useSWR<TextbookResp[]>(key, httpClient.get, defaultErrConfig);
}

// 题目列表
export function useQuestionList(source: QuestionPageSource, search: QuestionSearch, pageNo: number) {
  const req: QuestionListReq = {
    source,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };
  if (search.eightIds && search.eightIds.length > 0) {
    req.questionCateIds = search.eightIds;
  }
  if (search.typeId > 0) {
    req.questionTypeId = search.typeId;
  }
  if (search.tagIds && search.tagIds.length > 0) {
    req.tagIds = search.tagIds;
  }
  if (search.id && search.id > 0) {
    req.ids = [search.id];
  }
  if (search.status !== undefined && search.status >= 0) {
    req.status = search.status;
  }
  if (search.dimensionIds && search.dimensionIds.length > 0) {
    req.dimensionIds = search.dimensionIds;
  }
  if (search.levelIds && search.levelIds.length > 0) {
    req.levelIds = search.levelIds;
  }
  if (search.sceneIds && search.sceneIds.length > 0) {
    req.sceneIds = search.sceneIds;
  }
  if (search.mistakeTipIds && search.mistakeTipIds.length > 0) {
    req.mistakeTipIds = search.mistakeTipIds;
  }

  const reqPath = '/question/list';
  // 我的页面没有区分度
  const isMy = source === QuestionPageSource.MyQuestion || source === QuestionPageSource.MyReview;
  const hasCateIds = !!req.questionCateIds?.length;

  const key = isMy || hasCateIds ? [reqPath, JSON.stringify(req)] : null;
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>(reqPath, req), defaultErrConfig);
}

// 首页统计面板
export function useBoardList(count: number = 10) {
  return useSWR<BoardResp>(`/stat/board/${count}`, httpClient.get, defaultErrConfig);
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

// 题目其它通用字典获取
export function useQuestionOtherDicts(twoLevelId: number, typeCode: string) {
  const key = twoLevelId > 0 && StringValidator.isNonEmpty(typeCode) ? `/other/dict/list/${twoLevelId}/${typeCode}` : null;
  return useSWRImmutable<TextbookOtherDictResp[]>(key, httpClient.get, defaultErrConfig);
}

// 用户中心导航菜单维护 - 获取指定深度的父级标识获取子菜单列表
export function useTextbookLevel(parentId: number = 0) {
  const key = parentId > 0 ? `/textbook/list/${parentId}/level` : null;
  return useSWRImmutable<TextbookResp[]>(key, httpClient.get, defaultErrConfig);
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

// 题目上传任务列表
export function useTaskList(reqInit: TaskListReq, pageNo: number, pageSize: number) {
  let req: TaskListReq = {
    taskType: reqInit.taskType,
    pageNo,
    pageSize,
  };

  if (reqInit.questionCateId && reqInit.questionCateId > 0) {
    req.questionCateId = reqInit.questionCateId;
  }

  const reqPath = '/task/list';
  const key = [reqPath, JSON.stringify(req)];
  return useSWR<TaskListResp>(key, () => httpClient.post<TaskListResp>(reqPath, req), defaultErrConfig);
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
