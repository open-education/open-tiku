import { useEffect, useMemo, useState } from "react";
import type { CommonPaperSearchReq, PaperPageSourceProps } from "~/type/paper";
import { usePaperList, useQuestionOtherDicts, useTextbooks } from "~/util/fetcher";
import { ArrayUtil } from "~/util/object";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { CommonPaperSearchConf } from "~/common/paper/config";
import { Separator } from "~/components/ui/separator";
import { SimpleAlert } from "~/common/alert";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { MyPaperList } from "~/home/paper/gen/list";
import { SimplePagination } from "~/common/page";
import { SimpleSheet } from "~/common/sheet";

interface MyPaperSearchListProps {
  pageSource: PaperPageSourceProps;
}

function MyPaperSearchList({ pageSource }: MyPaperSearchListProps) {
  // 默认的搜索属性
  const defaultSearchReq: CommonPaperSearchReq = {
    relatedId: 0,
    relatedName: "",
    tag: "",
    year: "",
    grade: "",
    semester: "",
    selectedKeys: [],
    paperType: 0,
    source: pageSource.source,
  };

  // 处理搜索信息, 惰性初始化将其它页面传递过来的值进行赋值
  const [searchReq, setSearchReq] = useState<CommonPaperSearchReq>(defaultSearchReq);
  const updateSearchReq = (key: keyof CommonPaperSearchReq, value: string | number | string[]) => {
    setSearchReq((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks(5);
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  const [twoLevelId, setTwoLevelId] = useState<number>(0);

  useEffect(() => {
    if (!searchReq.relatedId || pathMap.size === 0) {
      return;
    }

    const nodes = pathMap.get(searchReq.relatedId.toString()) ?? [];
    const twoLevelId = nodes.length >= 2 ? nodes[1].id : 0;
    setTwoLevelId(twoLevelId);
  }, [searchReq.relatedId, pathMap]);

  // 查询题目类型和标签 核心素养
  const { data: questionTypes = [], isLoading: questionTypesLoading, error: questionTypesErr } = useQuestionOtherDicts(twoLevelId, "question_type");
  const questionTypeDict = useMemo(() => ArrayUtil.arrayToDict(questionTypes, "id"), [questionTypes]);

  const { data: questionTags = [], isLoading: questionTagsLoading, error: questionTagsErr } = useQuestionOtherDicts(twoLevelId, "question_tag");
  const questionTagDict = useMemo(() => ArrayUtil.arrayToDict(questionTags, "id"), [questionTags]);

  const {
    data: questionDimensions = [],
    isLoading: questionDimensionsLoading,
    error: questionDimensionsErr,
  } = useQuestionOtherDicts(twoLevelId, "question_dimension");
  const questionDimensionDict = useMemo(() => ArrayUtil.arrayToDict(questionDimensions, "id"), [questionDimensions]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 页码
  const [pageNo, setPageNo] = useState<number>(1);

  // 加载试卷列表
  const {
    data: paperListResp = {
      list: [],
      pageNo: pageNo,
      pageSize: 12,
      total: 0,
    },
    isLoading: paperListIsLoading,
    error: paperListErr,
    mutate: paperListRespMutate,
  } = usePaperList(searchReq, pageNo);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  return (
    <div className="p-4">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        <CommonPaperSearchConf textbooks={textbooks} search={searchReq} updateCommonPaperSearchReq={updateSearchReq} />
      </div>

      <div className="mt-3">
        <Separator />
      </div>

      {/* 列表显示错误 */}
      {textbooksErr && (
        <div className="mt-3">
          <SimpleAlert title="章节/考点导航获取失败" message={textbooksErr.message} />
        </div>
      )}
      {questionTypesErr && (
        <div className="mt-3">
          <SimpleAlert title="题目类型获取失败" message={questionTypesErr.message} />
        </div>
      )}
      {questionTagsErr && (
        <div className="mt-3">
          <SimpleAlert title="题目标签获取失败" message={questionTagsErr.message} />
        </div>
      )}
      {questionDimensionsErr && (
        <div className="mt-3">
          <SimpleAlert title="题目核心素养获取失败" message={questionDimensionsErr.message} />
        </div>
      )}
      {paperListErr && (
        <div className="mt-3">
          <SimpleAlert title="试卷列表获取失败" message={paperListErr.message} />
        </div>
      )}

      {/* 加载中提示 */}
      {useDelayedLoading(
        isLoading || textbooksIsLoading || paperListIsLoading || questionTypesLoading || questionTagsLoading || questionDimensionsLoading,
      ) && <Loading />}

      {/* 试卷列表 */}
      <div className="mt-3 bg-gray-50">
        <MyPaperList
          search={searchReq}
          paperList={paperListResp.list}
          paperListRespMutate={paperListRespMutate}
          questionTypeDict={questionTypeDict}
          questionTagDict={questionTagDict}
          questionDimensionDict={questionDimensionDict}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setIsLoading={setIsLoading}
        />
      </div>

      {/* 分页信息 */}
      {paperListResp.total > 0 && (
        <div className="mt-3">
          <SimplePagination
            pageNo={paperListResp.pageNo}
            pageSize={paperListResp.pageSize}
            total={paperListResp.total}
            onPageChange={(pageNo) => {
              setPageNo(pageNo);
            }}
          />
        </div>
      )}

      {/* 试卷页面Sheet内容 */}
      <div>
        <SimpleSheet openSheet={openSheet} setOpenSheet={setOpenSheet} sheetTitle={sheetTitle} sheetDesc={sheetDesc} sheetContent={sheetContent} />
      </div>
    </div>
  );
}

export { MyPaperSearchList };
