import { PaperMetaSearchConf } from "~/common/paper/config";
import type { Route } from "./+types/index";
import type { PaperMetaSearch } from "~/type/paper";
import { useState } from "react";
import { usePaperList, useTextbooks } from "~/util/fetcher";
import { Separator } from "~/components/ui/separator";
import { SimpleAlert } from "~/common/alert";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { SimplePagination } from "~/common/page";
import { SimpleSheet } from "~/common/sheet";
import { PaperGenList } from "~/paper/gen/list";

// 我的试卷

export function meta({}: Route.MetaArgs) {
  return [{ title: "我的试卷" }, { name: "description", content: "管理我的试卷" }];
}

// 默认的搜索属性
const defaultMetaSearch: PaperMetaSearch = {
  relatedId: 0,
  relatedName: "",
  tag: "",
  year: "",
  grade: "",
  semester: "",
  selectedKeys: [],
  paperType: 0,
  source: "my",
};

export default function Index() {
  // 处理搜索信息, 惰性初始化将其它页面传递过来的值进行赋值
  const [metaSearch, setMetaSearch] = useState<PaperMetaSearch>(defaultMetaSearch);
  const updateSearchMeta = (key: keyof PaperMetaSearch, value: string | number | string[]) => {
    setMetaSearch((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks(5);

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
  } = usePaperList(metaSearch, pageNo);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        <PaperMetaSearchConf textbooks={textbooks} metaSearch={metaSearch} updateSearchMeta={updateSearchMeta} />
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

      {paperListErr && (
        <div className="mt-3">
          <SimpleAlert title="试卷列表获取失败" message={paperListErr.message} />
        </div>
      )}

      {/* 加载中提示 */}
      {useDelayedLoading(isLoading || textbooksIsLoading || paperListIsLoading) && <Loading />}

      {/* 试卷列表 */}
      <div className="mt-3 bg-gray-50">
        <PaperGenList
          metaSearch={metaSearch}
          paperList={paperListResp.list}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
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
