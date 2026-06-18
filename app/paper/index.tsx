import { NotepadTextDashed } from "lucide-react";
import React, { useState } from "react";
import { ChapterDropdownNav } from "~/common/paper/nav";
import { ExamPaper } from "~/common/paper/meta";
import { TagSelect } from "~/common/paper/tag";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { YearSelect } from "~/common/paper/year";
import { Button } from "~/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Spinner } from "~/components/ui/spinner";
import type { PaperMeta, PaperMetaSearch } from "~/type/paper";
import type { Textbook } from "~/type/textbook";
import Add from "~/paper/add";
import { StringConst } from "~/util/string";
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

  const papers: PaperMeta[] = [];

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

      <div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <NotepadTextDashed />
            </EmptyMedia>
            <EmptyTitle>No Data</EmptyTitle>
            <EmptyDescription>没有查找到任何试卷，如有试卷，可以尝试上传试卷，管理员审核通过后，其它人就可以看到该试卷了。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>

      <div className="fixed inset-0 grid place-items-center pointer-events-none">
        <div className="px-6 py-3 rounded-lg pointer-events-auto">
          <Button variant="ghost" disabled>
            <Spinner className="size-8" />
            Please wait...
          </Button>
        </div>
      </div>

      <div>
        <ExamPaper papers={papers} />
      </div>

      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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
