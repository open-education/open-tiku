import { useState } from "react";
import { SimplePagination } from "~/common/page";
import type { CommonGenPaperGenConf } from "~/type/paper";
import type { QuestionSearch } from "~/type/question";
import { PaperStatus } from "~/util/enum";
import { useQuestionList } from "~/util/fetcher";
import { StringConst } from "~/util/string";
import { GenInfoReplaceList } from "./info";

// 替换题目, 其实筛选条件是固定的，就是继续展示其它题目

interface ReplaceQuestionProps {
  conf: CommonGenPaperGenConf; // 试卷配置
  questionTypeId: number; // 当前题目类型
}

function ReplaceQuestion({ conf, questionTypeId }: ReplaceQuestionProps) {
  // 查询题目列表
  const [pageNo, setPageNo] = useState<number>(1);

  const search: QuestionSearch = {
    twoLevelId: 0,
    fiveLevelId: 0,
    fiveLevelSelectKeys: [],
    eightIds: conf.questionCateIds,
    eightLevelSelectKeys: [],
    typeId: questionTypeId,
    tagIds: conf.tagIds || [],
    status: PaperStatus.Drafing,
    dimensionIds: conf.dimensionIds || [],
  };

  const {
    data: questionListResp = { list: [], pageNo: pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: questionListRespLoading,
    error: questionListRespErr,
    mutate: questionListRespMutate,
  } = useQuestionList("list", search, pageNo);

  return (
    <div>
      {/* 题目列表 */}
      <GenInfoReplaceList listResp={questionListResp.list} />

      {/* 分页 */}
      {questionListResp.total > 0 && (
        <div className="mt-3 mb-3">
          <SimplePagination
            pageNo={questionListResp.pageNo}
            pageSize={questionListResp.pageSize}
            total={questionListResp.total}
            onPageChange={(pageNo) => {
              setPageNo(pageNo);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { ReplaceQuestion };
