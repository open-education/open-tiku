import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import { httpClient } from "~/util/http";
import type { Textbook } from "~/type/textbook";
import type { PaperListReq, PaperListResp, PaperMeta, PaperMetaSearch } from "~/type/paper";
import { StringConst, StringValidator } from "~/util/string";

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
export function usePaperList(metaSearch: PaperMetaSearch, pageNo: number) {
  const req: PaperListReq = {
    relatedId: metaSearch.relatedId,
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
  };
  if (StringValidator.isNonEmpty(metaSearch.tag)) {
    req.tag = metaSearch.tag;
  }
  if (StringValidator.isNonEmpty(metaSearch.year)) {
    req.year = metaSearch.year;
  }
  if (StringValidator.isNonEmpty(metaSearch.grade) && metaSearch.grade !== "不选") {
    req.grade = metaSearch.grade;
  }
  if (StringValidator.isNonEmpty(metaSearch.semester) && metaSearch.semester !== "不选") {
    req.semester = metaSearch.semester;
  }

  // 生成 SWR 的 key（只有 relatedId > 0 时才发起请求，否则为 null）
  const swrKey = req.relatedId > 0 ? JSON.stringify(req) : null;

  return useSWR(swrKey, () => httpClient.post<PaperListResp>("/paper/list", req), {
    keepPreviousData: true, // 分页切换时保留旧数据，体验更好
  });
}
