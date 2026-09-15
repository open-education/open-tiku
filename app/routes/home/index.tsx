import { ChapterExpandNav, type LevelProps, type SelectNavProps } from '~/common/nav';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '~/components/ui/button';
import { ArrowRight, FileQuestionMark, FileText, Flame, SquarePen, TableOfContents, Video } from 'lucide-react';
import { Hero } from '~/home/hero';
import { PaperList } from '~/common/paper/list';
import { Loading } from '~/common/load';
import { Board } from '~/home/board';
import { Note } from '~/home/note';
import { Teacher } from '~/home/teacher';
import { NavLink } from 'react-router';
import { useBoardList, useLatestPapers, useTextbooks } from '~/util/fetcher';
import type { OtherDictListRecord, TextbookResp } from '~/type/textbook';
import { SimpleSheet } from '~/common/sheet';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { Badge } from '~/components/ui/badge';
import { SimpleAlert } from '~/common/alert';
import { createTextbookPathDict } from '~/util/textbook-dict';

// 默认空的通用字典信息
const defaultOtherDictListRecord: OtherDictListRecord = {
  questionTypes: [],
  questionTypeDict: {},
  questionTags: [],
  questionTagDict: {},
  questionDimensions: [],
  questionDimensionDict: {},
  questionLevels: [],
  questionLevelDict: {},
  questionScenes: [],
  questionSceneDict: {},
  questionMistakeTips: [],
  questionMistakeTipDict: {},
};

// 默认首页
export default function Index() {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  const showNav = () => {
    if (textbooksIsLoading) {
      return <div>加载中...</div>;
    } else if (textbooksErr) {
      return <SimpleAlert title="导航获取错误" message={textbooksErr.message} />;
    } else if (textbooks.length === 0) {
      return <div className="px-4 py-8 text-center text-xs">暂无数据</div>;
    } else {
      return (
        <ChapterExpandNav
          textbooks={textbooks}
          onSelectionChange={(selection, selectedTextbooks) => {
            handleNavSelectionChange(selection, selectedTextbooks);
          }}
          actions={actions}
        />
      );
    }
  };

  // 组件挂载时查询最新的几张试卷
  const { data: latestPapers = [], isLoading: latestIsLoading, error: latestPapersErr } = useLatestPapers();
  const showLatestPaper = () => {
    if (latestIsLoading) {
      return <div>加载中...</div>;
    } else if (latestPapersErr) {
      return <SimpleAlert title="最新试卷获取错误" message={latestPapersErr.message} />;
    } else if (latestPapers.length === 0) {
      return <div className="px-4 py-8 text-center text-xs">暂无数据</div>;
    } else {
      return (
        <PaperList
          papers={latestPapers}
          otherDictListRecord={defaultOtherDictListRecord}
          setOpenSheet={setOpenSheet}
          setSheetTitle={setSheetTitle}
          setSheetDesc={setSheetDesc}
          setSheetContent={setSheetContent}
          setLoading={setIsLoading}
        />
      );
    }
  };

  // 导航选择的 selectedKeys 值
  const [selectNavProps, setSelectNavProps] = useState<SelectNavProps>({
    selectedKeys: [],
    // 记录末级标识和名称
    relatedId: 0,
    relatedName: '',
  });
  const handleNavSelectionChange = useCallback((selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, TextbookResp | null>) => {
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
          <NavLink to={'student'} state={{ selectNavProps }}>
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

  // 统计面板数据
  const {
    data: boardResp = {
      countInfo: { textbookNum: 0, questionNum: 0, paperNum: 0, teacherNum: 0, studentNum: 0 },
      latestQuestions: [],
      topTeacherQuestions: [],
      topTextbooks: [],
    },
    isLoading: boardRespLoading,
    error: boardRespErr,
  } = useBoardList();
  const showBoard = () => {
    if (boardRespLoading) {
      return <div>加载中...</div>;
    } else if (boardRespErr) {
      return <SimpleAlert title="统计信息获取错误" message={boardRespErr.message} />;
    } else {
      return <Board pathMap={pathMap} boardResp={boardResp} />;
    }
  };

  return (
    <div>
      {/* 加载中提示 */}
      {useDelayedLoading(isLoading) && <Loading />}

      {/* 使命 */}
      <div className="bg-muted">
        <Hero countInfo={boardResp.countInfo} />
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

        {showNav()}
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

        {showLatestPaper()}
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

        {showBoard()}
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
