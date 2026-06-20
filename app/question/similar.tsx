import { useState } from "react";
import { SimpleAlert } from "~/common/alert";
import { SimpleNoData } from "~/common/empty";
import { Loading } from "~/common/load";
import { SimplePagination } from "~/common/page";
import { SimilarQuestionListShow } from "~/common/question/list";
import type { TextbookOtherDict } from "~/type/textbook";
import { useSimilarList } from "~/util/fetcher";
import { StringConst } from "~/util/string";

/// 变式题列表, 暂时未设计详情

interface SimilarQuestionListProps {
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionId: number;
  eightId: number;
}

export function SimilarQuestionList({ questionTypeDict, questionTagDict, questionId, eightId }: SimilarQuestionListProps) {
  const [pageNo, setPageNo] = useState<number>(1);

  // 标签和题型暂时不支持查询
  const {
    data: listResp = {
      list: [],
      pageNo,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading,
    error,
  } = useSimilarList(questionId, eightId, pageNo);

  return (
    <div className="pl-4">
      {/* 空数据提示 */}
      {listResp.total == 0 && (
        <div className="mt-3">
          <SimpleNoData desc="没有查找到该题目的任何变式题，请尝试在母题下面添加变式题，提交审核通过后就可以查看变式题了。" />
        </div>
      )}

      {/* 相关错误信息 */}
      {error && (
        <div className="mt-3">
          <SimpleAlert title="变式题列表获取失败" message={error.message} />
        </div>
      )}

      {/* 加载中提示 */}
      {isLoading && <Loading />}

      {/* 题目列表 */}
      <div className="text-sm">
        <SimilarQuestionListShow questionTypeDict={questionTypeDict} questionTagDict={questionTagDict} listResp={listResp} />
      </div>

      {/* 分页 */}
      {listResp.total > 0 && (
        <div className="mt-3 mb-3">
          <SimplePagination
            pageNo={listResp.pageNo}
            pageSize={listResp.pageSize}
            total={listResp.total}
            onPageChange={(pageNo) => {
              setPageNo(pageNo);
            }}
          />
        </div>
      )}
    </div>
  );
}
