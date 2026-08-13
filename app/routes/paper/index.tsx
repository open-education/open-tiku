import type { Route } from "./+types/index";
import React, { useEffect, useMemo, useState } from "react";
import { type SelectNavProps } from "~/common/nav";
import { PaperList } from "~/common/paper/list";
import { Button } from "~/components/ui/button";
import type { CommonPaperSearchReq } from "~/type/paper";
import TopAdd from "~/paper/top/add";
import { StringValidator } from "~/util/string";
import { SimplePagination } from "~/common/page";
import { Separator } from "~/components/ui/separator";
import { Loading } from "~/common/load";
import { usePaperList, useQuestionOtherDicts, useTextbooks } from "~/util/fetcher";
import { useLocation } from "react-router";
import { SimpleAlert } from "~/common/alert";
import { SimpleSheet } from "~/common/sheet";
import { SimpleNoData } from "~/common/empty";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Plus } from "lucide-react";
import type { UserInfoResp } from "~/type/user";
import { useUser } from "~/hooks/use-user";
import { CommonPaperSearchConf } from "~/common/paper/config";
import GenAdd from "~/paper/gen/add";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { ArrayUtil } from "~/util/object";

// 重新网页标题等
export function meta({}: Route.MetaArgs) {
  return [{ title: "试卷库" }, { name: "description", content: "精选历年高考，中考试卷；收录名校期末和月考试卷。" }];
}

// 默认的搜索属性
const defaultSearch: CommonPaperSearchReq = {
  relatedId: 0,
  relatedName: "",
  tag: "",
  year: "",
  grade: "",
  semester: "",
  selectedKeys: [],
  paperType: 0,
  source: "list",
};

// 试卷管理首页
export default function Index() {
  // 获取用户信息
  const currentUser: UserInfoResp | null = useUser();

  const location = useLocation();
  // 首页可能传递过来已经选择好的导航级联信息keys列表
  const selectNavProps: SelectNavProps = location.state?.selectNavProps ?? {};

  // 处理搜索信息, 惰性初始化将其它页面传递过来的值进行赋值
  const [searchReq, setSearchReq] = useState<CommonPaperSearchReq>(() => {
    const initial = { ...defaultSearch };

    if (selectNavProps.relatedId > 0) {
      initial.relatedId = selectNavProps.relatedId;
    }
    if (StringValidator.isNonEmpty(selectNavProps.relatedName)) {
      initial.relatedName = selectNavProps.relatedName;
    }
    if (selectNavProps.selectedKeys?.length) {
      initial.selectedKeys = selectNavProps.selectedKeys;
    }
    return initial;
  });
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

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>(null);
  // 列表相关错误信息展示
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
  } = usePaperList(searchReq, pageNo);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  // 添加试卷Sheet
  const handlePaperTopAdd = () => {
    setSheetTitle("精选试卷");
    setSheetDesc("精选历年高考，中考试卷；收录名校期末和月考试卷。");
    setSheetContent(<TopAdd searchReq={searchReq} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />);
    setOpenSheet(true);
  };

  // 生成试卷
  const handlePapgerGenAdd = () => {
    setSheetTitle("手动组卷");
    setSheetDesc("根据你选择的条件进行自动组卷, 生成试卷后请回到列表查看和修改");
    setSheetContent(<GenAdd searchReq={searchReq} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />);
    setOpenSheet(true);
  };

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        <CommonPaperSearchConf textbooks={textbooks} search={searchReq} updateCommonPaperSearchReq={updateSearchReq} />

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">操作:</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1">
              {currentUser && (
                <>
                  <Button variant="outline" onClick={handlePaperTopAdd} className="text-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    精选试卷
                  </Button>
                  <Button variant="outline" onClick={handlePapgerGenAdd} className="text-sm">
                    <Plus className="mr-2 h-4 w-4" />
                    手动组卷
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Separator />
      </div>

      {/* 列表显示错误 */}
      {textbooksErr && (
        <div className="mt-3">
          <SimpleAlert title="导航获取失败" message={textbooksErr.message} />
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
          <SimpleAlert title="列表获取失败" message={paperListErr.message} />
        </div>
      )}
      {warnInfo && <div className="mt-3">{warnInfo}</div>}

      {/* 空数据提示 */}
      {paperListResp.total == 0 && (
        <div className="mt-3">
          <SimpleNoData desc="没有查找到任何试卷，如有试卷，可以尝试添加试卷，管理员审核通过后，其他人就可以看到该试卷了。" />
        </div>
      )}

      {/* 加载中提示 */}
      {useDelayedLoading(
        isLoading || paperListIsLoading || textbooksIsLoading || questionTypesLoading || questionTagsLoading || questionDimensionsLoading,
      ) && <Loading />}

      {/* 试卷列表 */}
      <div className="mt-3">
        <PaperList
          papers={paperListResp.list}
          search={searchReq}
          questionTypeDict={questionTypeDict}
          questionTagDict={questionTagDict}
          questionDimensionDict={questionDimensionDict}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
          setWarnInfo={setWarnInfo}
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
