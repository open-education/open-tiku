import { ChapterExpandNav, type LevelProps, type SelectNavProps } from '~/common/nav';
import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/button';
import { ArrowRight, FileQuestionMark, FileText, Flame, SquarePen, TableOfContents, Video } from 'lucide-react';
import { Hero } from '~/home/hero';
import { PaperList } from '~/common/paper/list';
import { Loading } from '~/common/load';
import { toast } from 'sonner';
import { Board } from '~/home/board';
import { Note } from '~/home/note';
import { Teacher } from '~/home/teacher';
import { NavLink } from 'react-router';
import { useLatestPapers, useTextbooks } from '~/util/fetcher';
import type { Textbook } from '~/type/textbook';
import { SimpleSheet } from '~/common/sheet';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { Badge } from '~/components/ui/badge';

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
    relatedName: '',
  });
  const handleNavSelectionChange = useCallback((selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, Textbook | null>) => {
    const curKeys: string[] = [];
    // 记录末级标识和名称, 有就一直覆盖到最后为止
    let curRelatedId: number = 0;
    let curRelatedName: string = '';
    if (selection.first) {
      curKeys.push(selection.first);
      curRelatedId = selectedTextbooks.first?.id ?? 0;
      curRelatedName = selectedTextbooks.fifth?.label ?? '';
    }
    if (selection.second) {
      curKeys.push(selection.second);
      curRelatedId = selectedTextbooks.second?.id ?? 0;
      curRelatedName = selectedTextbooks.second?.label ?? '';
    }
    if (selection.third) {
      curKeys.push(selection.third);
      curRelatedId = selectedTextbooks.third?.id ?? 0;
      curRelatedName = selectedTextbooks.third?.label ?? '';
    }
    if (selection.fourth) {
      curKeys.push(selection.fourth);
      curRelatedId = selectedTextbooks.fourth?.id ?? 0;
      curRelatedName = selectedTextbooks.fourth?.label ?? '';
    }
    if (selection.fifth) {
      curKeys.push(selection.fifth);
      curRelatedId = selectedTextbooks.fifth?.id ?? 0;
      curRelatedName = selectedTextbooks.fifth?.label ?? '';
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
          <Video size={14} />
          <NavLink to={''} state={{ selectNavProps }}>
            上传视频
          </NavLink>
        </Button>
        <Button className="w-32 text-sm" variant="outline" size="lg">
          <FileText size={14} />
          <NavLink to={'paper'} state={{ selectNavProps }}>
            上传试卷
          </NavLink>
        </Button>
        <Button className="w-32 text-sm" variant="outline" size="lg">
          <FileQuestionMark size={14} />
          <NavLink to={'question'} state={{ selectNavProps }}>
            上传题目
          </NavLink>
        </Button>

        <Button className="w-32 text-sm" variant="default" size="lg">
          <SquarePen size={14} />
          <NavLink to={''} state={{ selectNavProps }}>
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
  const [sheetTitle, setSheetTitle] = useState<string>('');
  const [sheetDesc, setSheetDesc] = useState<string>('');
  const [sheetContent, setSheetContent] = useState<React.ReactNode>('');

  return (
    <div>
      {/* 加载中提示 */}
      {useDelayedLoading(isLoading || textbooksIsLoading || latestIsLoading) && <Loading />}

      {/* 使命 */}
      <div className="bg-muted">
        <Hero />
      </div>

      {/* 关键导航 */}
      <div className="mt-4 p-4 bg-muted">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <TableOfContents size={20} />
              <span className="font-semibold">关键导航</span>
            </div>
            <Badge variant="ghost" className="font-normal">
              视频 · 试卷 · 题目 · 练题
            </Badge>
          </div>
        </div>

        <ChapterExpandNav
          textbooks={textbooks}
          onSelectionChange={(selection, selectedTextbooks) => {
            handleNavSelectionChange(selection, selectedTextbooks);
          }}
          actions={actions}
        />
      </div>

      {/* 精选试卷 */}
      <div className="mt-4 p-4 bg-muted">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-500">
              <FileText size={20} />
              <span className="font-semibold">精选试卷</span>
            </div>
            <Badge variant="ghost" className="font-normal">
              中高考 · 期末月考 · 名校特供
            </Badge>
          </div>
          <NavLink to={'/paper'}>
            <div className="flex items-center gap-1 text-xs">
              全部试卷 <ArrowRight size={11} />
            </div>
          </NavLink>
        </div>

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
      <div className="mt-4 p-4 bg-muted">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-red-500">
              <Flame size={20} />
              <span className="font-semibold">热点榜单</span>
            </div>
            <Badge variant="ghost" className="font-normal">
              题目 · 教材 · 用户
            </Badge>
          </div>
        </div>

        <Board />
      </div>

      {/* 网站碎碎念 */}
      <div className="mt-4 p-4 bg-muted">
        <Note />
      </div>

      {/* 成为教师 */}
      <div className="mt-4 p-4 bg-muted">
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
