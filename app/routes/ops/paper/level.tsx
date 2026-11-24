import { ChapterExpandNav, ChapterTreeCheckboxNav } from '@/components/common/nav';
import { LayerList, LevelInfo, TitleInfoCard } from '@/components/paper/config';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomPageSource, CustomUserSource, QuestionPageSource } from '@/type/enum';
import type { QuestionListReq } from '@/type/question';
import type { TextbookFillLevel } from '@/type/textbook';
import { useCustomList, useQuestionCates, useQuestionOtherDictList, useTextbooks } from '@/util/fetcher';
import { CustomUtil, TextbookUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';
import type { Route } from './+types/level';

// 智能组卷

export function meta({}: Route.MetaArgs) {
  return [
    { title: '分层组卷' },
    {
      name: 'description',
      content: '个人中心, 系统设置, 关联教材章节和知识点知识点的关联关系',
    },
  ];
}

export default function Index() {
  //todo 暂时用题目列表搜索
  const [listReq, setListReq] = useState<QuestionListReq>({ source: QuestionPageSource.List, pageNo: 1, pageSize: StringConst.pageSize });
  const updateListReq = (key: keyof QuestionListReq, val: string | number[] | number) => {
    setListReq((prev) => ({ ...prev, [key]: val }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();

  // 查询题目类型和标签等信息
  const [twoLevelId, setTwoLevelId] = useState<number>(0);
  const {
    data: dictListResp = { map: {} },
    isLoading: dictListRespLoading,
    error: dictListRespErr,
  } = useQuestionOtherDictList(twoLevelId, [
    'question_type',
    'question_tag',
    'question_dimension',
    'question_level',
    'question_scene',
    'question_mistake_tip',
  ]);
  const otherDictListRecord = useMemo(() => {
    return TextbookUtil.createOtherDictListRecord(dictListResp);
  }, [dictListResp]);

  // 获取教材/知识点题型列表
  const [fiveLevelId, setFiveLevelId] = useState<number>(0);
  const { data: questionCates = [], isLoading: questionCatesLoading, error: questionCatesErr } = useQuestionCates(fiveLevelId);

  const [fillLevel, setFillLevel] = useState<TextbookFillLevel>({ eightLevelKeys: [], fiveLevelKeys: [] });
  const updateFillLevel = (key: keyof TextbookFillLevel, val: string[]) => {
    setFillLevel((prev) => ({ ...prev, [key]: val }));
  };

  // 用户个性化配置
  const {
    data: customListResp = [],
    isLoading: customListRespLoading,
    error: customListRespErr,
  } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.defaultTextbookUpdate(customListResp, updateFillLevel, updateListReq, setFiveLevelId, setTwoLevelId);
  }, [customListResp]);

  // 左边内容
  const leftContent = (
    <div className="p-3 space-y-2 bg-card">
      <ChapterExpandNav
        textbooks={textbooks}
        defaultValues={fillLevel.fiveLevelKeys}
        onSelectionChange={(items) => {
          TextbookUtil.textbookPathUpdate(items, updateListReq, setFiveLevelId, setTwoLevelId);
          // 需要清空后3层菜单
          if (items && items.length > 0) {
            updateListReq('questionCateIds', []);
          }
        }}
      />

      <ChapterTreeCheckboxNav
        textbooks={questionCates}
        onSelect={(items) => {
          const ids = items.filter((item) => item.tableName === StringConst.questionCateTableName).map((item) => item.id);
          updateListReq('questionCateIds', ids);
        }}
        defaultSelectedKeys={fillLevel.eightLevelKeys}
        maxDepth={3}
      />
    </div>
  );

  // 中间内容
  const middleContent = (
    <div className="space-y-2">
      <LevelInfo />
      <LayerList />
    </div>
  );

  // 右边内容
  const rightContent = (
    <div className="space-y-2">
      <TitleInfoCard />
    </div>
  );

  // 移动端
  if (useIsMobile()) {
    return (
      <div className="space-y-3">
        {leftContent}
        {middleContent}
        {rightContent}
      </div>
    );
  }

  // PC 端
  return (
    <ResizablePanelGroup orientation="horizontal" className="border flex-col! md:flex-row!">
      <ResizablePanel defaultSize="30%">
        <div className="pr-1.5">{leftContent}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="40%">
        <div className="pl-1.5 pr-1.5">{middleContent}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="30%">
        <div className="pl-1.5">{rightContent}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
