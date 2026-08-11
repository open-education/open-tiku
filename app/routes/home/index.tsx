import { ChapterExpandNav, type LevelProps, type SelectNavProps } from "~/common/nav";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { ArrowRight, GraduationCap, Upload } from "lucide-react";
import { CountStats } from "~/home/stats";
import { PaperHeader, PaperList } from "~/common/paper/list";
import { Loading } from "~/common/load";
import { toast } from "sonner";
import { Board } from "~/home/board";
import { Note } from "~/home/note";
import { Teacher } from "~/home/teacher";
import { NavLink } from "react-router";
import { useLatestPapers, useTextbooks } from "~/util/fetcher";
import type { Textbook } from "~/type/textbook";
import { SimpleSheet } from "~/common/sheet";
import { useDelayedLoading } from "~/hooks/delayed-loading";

// 默认首页
export default function Index() {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  if (textbooksErr) {
    toast.error(<div className="text-red-700">{textbooksErr.message}</div>);
  }

  // 组件挂载时查询最新的几张试卷
  const { data: latestPapers = [], isLoading: latestIsLoading, error: latestPapersErr } = useLatestPapers();
  if (latestPapersErr) {
    toast.error(<div className="text-red-700">{latestPapersErr.message}</div>);
  }

  // 导航选择的 selectedKeys 值
  const [selectNavProps, setSelectNavProps] = useState<SelectNavProps>({
    selectedKeys: [],
    // 记录末级标识和名称
    relatedId: 0,
    relatedName: "",
  });
  const handleNavSelectionChange = useCallback((selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, Textbook | null>) => {
    const curKeys: string[] = [];
    // 记录末级标识和名称, 有就一直覆盖到最后为止
    let curRelatedId: number = 0;
    let curRelatedName: string = "";
    if (selection.first) {
      curKeys.push(selection.first);
      curRelatedId = selectedTextbooks.first?.id ?? 0;
      curRelatedName = selectedTextbooks.fifth?.label ?? "";
    }
    if (selection.second) {
      curKeys.push(selection.second);
      curRelatedId = selectedTextbooks.second?.id ?? 0;
      curRelatedName = selectedTextbooks.second?.label ?? "";
    }
    if (selection.third) {
      curKeys.push(selection.third);
      curRelatedId = selectedTextbooks.third?.id ?? 0;
      curRelatedName = selectedTextbooks.third?.label ?? "";
    }
    if (selection.fourth) {
      curKeys.push(selection.fourth);
      curRelatedId = selectedTextbooks.fourth?.id ?? 0;
      curRelatedName = selectedTextbooks.fourth?.label ?? "";
    }
    if (selection.fifth) {
      curKeys.push(selection.fifth);
      curRelatedId = selectedTextbooks.fifth?.id ?? 0;
      curRelatedName = selectedTextbooks.fifth?.label ?? "";
    }

    setSelectNavProps({
      selectedKeys: curKeys,
      relatedId: curRelatedId,
      relatedName: curRelatedName,
    });
  }, []);

  // 主要导航操作区域
  const actions = (
    <div className="flex flex-wrap items-center justify-end gap-4">
      <div className="flex flex-wrap gap-2.5">
        <Button className="w-32 text-sm" variant="outline" size="lg">
          <Upload size={14} />
          <NavLink to={""} state={{ selectNavProps }}>
            上传视频
          </NavLink>
        </Button>
        <Button className="w-32 text-sm" variant="outline" size="lg">
          <Upload size={14} />
          <NavLink to={"paper"} state={{ selectNavProps }}>
            上传试卷
          </NavLink>
        </Button>
        <Button className="w-32 text-sm" variant="outline" size="lg">
          <Upload size={14} />
          <NavLink to={"question"} state={{ selectNavProps }}>
            上传题目
          </NavLink>
        </Button>

        <Button className="w-32 text-sm" variant="default" size="lg">
          <GraduationCap size={14} />
          <NavLink to={""} state={{ selectNavProps }}>
            开始练题
          </NavLink>
          <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  );

  // 首页加载中样式
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetDesc, setSheetDesc] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>("");

  return (
    <div>
      {/* 加载中提示 */}
      {useDelayedLoading(isLoading || textbooksIsLoading || latestIsLoading) && <Loading />}

      {/* 统计总数*/}
      <div className="mx-4 mt-3 sm:mx-16 sm:mt-4">
        <CountStats />
      </div>

      {/* 关键导航 */}
      <div className="mx-4 mt-3 sm:mx-16 sm:mt-4">
        <ChapterExpandNav
          textbooks={textbooks}
          onSelectionChange={(selection, selectedTextbooks) => {
            handleNavSelectionChange(selection, selectedTextbooks);
          }}
          actions={actions}
        />
      </div>

      {/* 精选试卷 */}
      <div className="mx-4 mt-3 sm:mx-16 sm:mt-4">
        <PaperHeader />
        <PaperList
          papers={latestPapers}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
        />
      </div>

      {/* 统计面板 */}
      <div className="mx-4 mt-3 sm:mx-16 sm:mt-4">
        <Board />
      </div>

      {/* 网站碎碎念 */}
      <div className="mx-4 mt-3 sm:mx-16 sm:mt-4">
        <Note />
      </div>

      {/* 成为教师 */}
      <div>
        <Teacher />
      </div>

      {/* 网站通用 Sheet */}
      {/* 试卷页面Sheet内容 */}
      <div>
        <SimpleSheet openSheet={openSheet} setOpenSheet={setOpenSheet} sheetTitle={sheetTitle} sheetDesc={sheetDesc} sheetContent={sheetContent} />
      </div>
    </div>
  );
}
