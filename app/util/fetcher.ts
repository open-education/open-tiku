import type { BoardResp } from '@/type/bord';
import type { QuestionListReq, QuestionListResp, QuestionSearch } from '@/type/question';
import type { TextbookOtherDictListReq, TextbookOtherDictListResp, TextbookResp } from '@/type/textbook';
import { httpClient } from '@/util/http';
import { StringConst } from '@/util/string';
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
  if (search.levelIds && search.levelIds.length > 0) {
    req.levelIds = search.levelIds;
  }
  if (search.sceneIds && search.sceneIds.length > 0) {
    req.sceneIds = search.sceneIds;
  }
  if (search.mistakeTipIds && search.mistakeTipIds.length > 0) {
    req.mistakeTipIds = search.mistakeTipIds;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const reqPath = '/question/list';
  const key = req.questionCateIds.length > 0 ? [reqPath, JSON.stringify(req)] : null;
  return useSWR<QuestionListResp>(key, () => httpClient.post<QuestionListResp>(reqPath, req), defaultErrConfig);
}

// 首页统计面板
export function useBoardList(count: number = 10) {
  return useSWR<BoardResp>(`/stat/board/${count}`, httpClient.get, defaultErrConfig);
}
