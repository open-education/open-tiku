import { AlertCircleIcon, NotepadTextDashed } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ChapterDropdownNav } from "~/common/nav";
import { ExamPaper } from "~/common/paper/meta";
import { TagSelect } from "~/common/paper/tag";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { YearSelect } from "~/common/paper/year";
import { Button } from "~/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { PaperListReq, PaperListResp, PaperMetaSearch } from "~/type/paper";
import type { Textbook } from "~/type/textbook";
import Add from "~/paper/add";
import { StringConst, StringValidator } from "~/util/string";
import { httpClient } from "~/util/http";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { SimplePagination } from "~/common/page";
import { Separator } from "~/components/ui/separator";
import { Loading } from "~/common/load";
import "katex/dist/katex.min.css";

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
export default function Index(props: any) {
  const textbooks: Textbook[] = props.textbooks ?? [];

  // 处理搜索信息
  const [metaSearch, setMetaSearch] = useState<PaperMetaSearch>(defaultMetaSearch);
  const updateSearchMeta = (key: keyof PaperMetaSearch, value: string | number | string[]) => {
    setMetaSearch((prev) => ({ ...prev, [key]: value }));
  };

  // 列表相关错误信息展示
  const [listWarnInfo, setListWarnInfo] = useState<React.ReactNode>("");
  // 列表加载状态标识
  const [listLoading, setListLoading] = useState<boolean>(false);
  // 页码
  const [pageNo, setPageNo] = useState<number>(1);
  const [paperListResp, setPaperListResp] = useState<PaperListResp>({
    list: [],
    pageNo: pageNo,
    pageSize: StringConst.pageSize,
    total: 0,
  });

  // 加载试卷列表
  useEffect(() => {
    // 考点/学段必须选择
    if (metaSearch.relatedId <= 0) {
      return;
    }

    setListLoading(true);

    const paperListReq: PaperListReq = {
      relatedId: metaSearch.relatedId,
      pageNo: pageNo,
      pageSize: StringConst.pageSize,
    };
    if (StringValidator.isNonEmpty(metaSearch.tag)) {
      paperListReq.tag = metaSearch.tag;
    }
    if (StringValidator.isNonEmpty(metaSearch.year)) {
      paperListReq.year = metaSearch.year;
    }
    if (StringValidator.isNonEmpty(metaSearch.grade) && metaSearch.grade !== "不选") {
      paperListReq.grade = metaSearch.grade;
    }
    if (StringValidator.isNonEmpty(metaSearch.semester) && metaSearch.semester !== "不选") {
      paperListReq.semester = metaSearch.semester;
    }

    httpClient
      .post<PaperListResp>("/paper/list", paperListReq)
      .then((res) => {
        setPaperListResp(res);
      })
      .catch((err) => {
        setListWarnInfo(
          <div className="mt-3">
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>列表获取失败</AlertTitle>
              <AlertDescription>{err.message}</AlertDescription>
            </Alert>
          </div>,
        );
      })
      .finally(() => {
        setListLoading(false);
      });
  }, [metaSearch, pageNo]);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<React.ReactNode>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  // 添加试卷Sheet
  const addExamSheet = () => {
    setSheetTitle("添加试卷");
    setSheetDesc("");
    setSheetContent(
      <Add
        textbooks={textbooks}
        metaSearch={metaSearch}
        setSheetTitle={setSheetTitle}
        setSheetDesc={setSheetDesc}
        setSheetContent={setSheetContent}
      />,
    );
    setOpenSheet(true);
  };

  return (
    <div>
      {/* 搜索选项 */}
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">学段/考点</div>
          <div className="col-span-4">
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
              defaultSelectedKeys={["some-key"]}
              placeholder="请选择学段"
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">标签</div>
          <div className="col-span-4">
            <TagSelect
              options={StringConst.examTags}
              defaultValue={metaSearch.tag}
              onSelect={(value) => {
                updateSearchMeta("tag", value);
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">年份</div>
          <div className="col-span-4">
            <YearSelect value={metaSearch.year} onValueChange={(val) => updateSearchMeta("year", val ?? "")} placeholder="选择年份" />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">年级</div>
          <div className="col-span-4">
            <GradeSelect value={metaSearch.grade} onValueChange={(val) => updateSearchMeta("grade", val ?? "")} placeholder="选择年级" />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">学期</div>
          <div className="col-span-4">
            <SemesterSelect value={metaSearch.semester} onValueChange={(val) => updateSearchMeta("semester", val ?? "")} placeholder="选择学期" />
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="col-span-1">操作入口</div>
          <div className="col-span-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={addExamSheet}>
              添加试卷
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3">
        <Separator />
      </div>

      {/* 列表显示错误 */}
      {listWarnInfo}

      {/* 空数据提示 */}
      {paperListResp.total == 0 && (
        <div className="mt-3">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <NotepadTextDashed />
              </EmptyMedia>
              <EmptyTitle>No Data</EmptyTitle>
              <EmptyDescription>没有查找到任何试卷，如有试卷，可以尝试上传试卷，管理员审核通过后，其他人就可以看到该试卷了。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}

      {/* 加载中提示 */}
      {listLoading && <Loading />}

      {/* 试卷列表 */}
      <div className="mt-3">
        <ExamPaper
          papers={paperListResp.list}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetContent={setSheetContent}
          setLoading={setListLoading}
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
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetContent className="w-[80vw]! max-w-[80vw]! sm:w-[70vw]! md:w-[80vw]! lg:w-[80vw]! overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{sheetTitle}</SheetTitle>
              <SheetDescription>{sheetDesc}</SheetDescription>
            </SheetHeader>
            <div className="px-4">{sheetContent}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
