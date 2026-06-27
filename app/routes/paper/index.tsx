import type { Route } from "./+types/index";
import React, { useState } from "react";
import { ChapterDropdownNav, type SelectNavProps } from "~/common/nav";
import { ExamPaper } from "~/common/paper/meta";
import { TagSelect } from "~/common/paper/tag";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { YearSelect } from "~/common/paper/year";
import { Button } from "~/components/ui/button";
import type { PaperMetaSearch } from "~/type/paper";
import type { Textbook } from "~/type/textbook";
import Add from "~/paper/add";
import { StringConst, StringValidator } from "~/util/string";
import { SimplePagination } from "~/common/page";
import { Separator } from "~/components/ui/separator";
import { Loading } from "~/common/load";
import { usePaperList, useTextbooks } from "~/util/fetcher";
import { toast } from "sonner";
import { useLocation } from "react-router";
import { SimpleAlert } from "~/common/alert";
import { SimpleSheet } from "~/common/sheet";
import { SimpleNoData } from "~/common/empty";
import { useDelayedLoading } from "~/hooks/delayed-loading";

// 重新网页标题等
export function meta({}: Route.MetaArgs) {
  return [{ title: "精选试卷" }, { name: "description", content: "精选历年高考，中考试卷；收录名校期末和月考试卷。" }];
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
};

// 试卷管理首页
export default function Index() {
  const location = useLocation();
  // 首页可能传递过来已经选择好的导航级联信息keys列表
  const selectNavProps: SelectNavProps = location.state?.selectNavProps ?? {};

  // 处理搜索信息, 惰性初始化将其它页面传递过来的值进行赋值
  const [metaSearch, setMetaSearch] = useState<PaperMetaSearch>(() => {
    const initial = { ...defaultMetaSearch };

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
  const updateSearchMeta = (key: keyof PaperMetaSearch, value: string | number | string[]) => {
    setMetaSearch((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIdLoading, error: textbooksErr } = useTextbooks(5);
  if (textbooksErr) {
    toast.error(<div className="text-red-700">{textbooksErr.message}</div>);
  }

  // 列表相关错误信息展示
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // 页码
  const [pageNo, setPageNo] = useState<number>(1);

  // 加载试卷列表
  const {
    data: paperListResp = {
      list: [],
      pageNo: pageNo,
      pageSize: StringConst.pageSize,
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

  // 添加试卷Sheet
  const addExamSheet = () => {
    setSheetTitle("添加试卷");
    setSheetDesc("当前为新增试卷模式");
    setSheetContent(<Add metaSearch={metaSearch} setSheetTitle={setSheetTitle} setSheetDesc={setSheetDesc} setSheetContent={setSheetContent} />);
    setOpenSheet(true);
  };

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4">
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">学段/考点:</div>
          <div className="flex-1 min-w-0">
            <ChapterDropdownNav
              textbooks={textbooks}
              onSelect={(selectedItems: Textbook[]) => {
                if (!selectedItems) {
                  updateSearchMeta("relatedId", 0);
                  updateSearchMeta("relatedName", "");
                  updateSearchMeta("selectedKeys", []);
                  return;
                }

                const current: Textbook = selectedItems[selectedItems.length - 1];
                updateSearchMeta("relatedId", current.id);
                updateSearchMeta("relatedName", current.label);
                updateSearchMeta(
                  "selectedKeys",
                  selectedItems.map((item) => item.key),
                );
              }}
              defaultSelectedKeys={metaSearch.selectedKeys}
              placeholder="请选择学段"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">标签:</div>
          <div className="flex-1 min-w-0">
            <TagSelect
              options={StringConst.examTags}
              defaultValue={metaSearch.tag}
              onSelect={(value) => {
                updateSearchMeta("tag", value);
              }}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">年份:</div>
          <div className="flex-1 min-w-0">
            <YearSelect value={metaSearch.year} onValueChange={(val) => updateSearchMeta("year", val ?? "")} placeholder="选择年份" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">年级:</div>
          <div className="flex-1 min-w-0">
            <GradeSelect value={metaSearch.grade} onValueChange={(val) => updateSearchMeta("grade", val ?? "")} placeholder="选择年级" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">学期:</div>
          <div className="flex-1 min-w-0">
            <SemesterSelect value={metaSearch.semester} onValueChange={(val) => updateSearchMeta("semester", val ?? "")} placeholder="选择学期" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">操作:</div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1">
              <Button variant="outline" onClick={addExamSheet} className="text-sm">
                添加试卷
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Separator />
      </div>

      {/* 列表显示错误 */}
      {paperListErr && (
        <div className="mt-3">
          <SimpleAlert title="列表获取失败" message={paperListErr.message} />
        </div>
      )}

      {/* 空数据提示 */}
      {paperListResp.total == 0 && (
        <div className="mt-3">
          <SimpleNoData desc="没有查找到任何试卷，如有试卷，可以尝试添加试卷，管理员审核通过后，其他人就可以看到该试卷了。" />
        </div>
      )}

      {/* 加载中提示 */}
      {useDelayedLoading(isLoading || paperListIsLoading || textbooksIdLoading) && <Loading />}

      {/* 试卷列表 */}
      <div className="mt-3">
        <ExamPaper
          papers={paperListResp.list}
          metaSearch={metaSearch}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
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
