import { SimpleAlert } from '@/common/alert';
import { AnswerInfo, QuestionInfo } from '@/common/question/info';
import { TagBottomShow, TagTopShow } from '@/common/question/tag';
import { MultiOptionShow } from '@/common/select';
import { TitleShow } from '@/common/title';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestionBaseInfoResp, QuestionInfoResp, QuestionListResp, QuestionPageSourceProps, QuestionSearch } from '@/type/question';
import type { OtherDictListRecord, TextbookOtherDictResp } from '@/type/textbook';
import { httpClient } from '@/util/http';
import { StringConst } from '@/util/string';
import { cn } from 'cn';
import React, { useMemo, useState } from 'react';
import type { KeyedMutator } from 'swr';

/// 题库题目列表展示

// 题目标题选项等公共部分展示
interface SingleQuestionCommonPartProps {
  pageSource: QuestionPageSourceProps;
  otherDictListRecord: OtherDictListRecord;
  questionInfo: QuestionBaseInfoResp;
  optBgClassName?: string;
}
function SingleQuestionCommonPart({ pageSource, otherDictListRecord, questionInfo, optBgClassName = 'bg-card' }: SingleQuestionCommonPartProps) {
  return (
    <>
      {/* 标签 */}
      <div className="flex flex-wrap gap-3 items-center w-full">
        <TagTopShow pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />
      </div>

      {/* 标题 */}
      <div className="mt-2.5">
        {<TitleShow id={questionInfo.id} title={questionInfo.title} comment={questionInfo.comment || ''} images={questionInfo.images} />}
      </div>

      {/* 选项内容 */}
      <div className="mt-2.5">
        {questionInfo.options && questionInfo.options.length > 0 && (
          <MultiOptionShow optionsLayout={questionInfo.optionsLayout || 1} options={questionInfo.options} bgClassName={optBgClassName} />
        )}
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-3 items-center w-full mt-2.5">
        <TagBottomShow pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />
      </div>
    </>
  );
}

// 普通列表展示, 需要查看详情等操作
interface QuestionListShowProps {
  pageSource: QuestionPageSourceProps;
  otherDictListRecord: OtherDictListRecord;
  listResp: QuestionListResp;
  questionSearch: QuestionSearch;
  questionListRespMutate: KeyedMutator<QuestionListResp>; // 审核删除等操作需要重置列表接口重新请求数据
}
function QuestionListShow({ pageSource, otherDictListRecord, listResp, questionSearch, questionListRespMutate }: QuestionListShowProps) {
  return (
    <>
      {listResp.list?.map((questionInfo) => {
        return (
          <div
            key={questionInfo.id}
            className="mt-4 first:mt-3 px-3 pt-3 bg-card transition-all duration-200 hover:shadow-lg hover:border-primary/10 border-border/60"
          >
            {/* 题干选项等部分 */}
            <SingleQuestionCommonPart pageSource={pageSource} otherDictListRecord={otherDictListRecord} questionInfo={questionInfo} />

            <Separator className="mt-2 bg-transparent border-t border-dashed border-slate-300" />

            {/* 题目其它标签, 比如查看答案, 关联题目等 */}
            <div className="flex flex-wrap gap-2 justify-start">
              <QuestionInfo otherDictListRecord={otherDictListRecord} baseInfoResp={questionInfo} />
            </div>
          </div>
        );
      })}
    </>
  );
}

// 变式题部分
interface SimilarListShowProps {
  otherDictListRecord: OtherDictListRecord;
  listResp: QuestionListResp | null;
}

function SimilarListShow({ otherDictListRecord, listResp }: SimilarListShowProps) {
  if (!listResp || !listResp.list || listResp.list.length === 0) {
    return <SimpleAlert title="查询变式题为空" message="母题未维护变式题或该题目不包含变式题" variant="default" />;
  }

  // 需要从字典中获取
  const LEVEL_CONFIG: TextbookOtherDictResp[] = otherDictListRecord.questionLevels.filter(
    (item) => !StringConst.ignoreQuestionLevelItems.includes(item.itemValue),
  );

  const ITEMS_PER_PAGE = 5;

  const [activeTab, setActiveTab] = useState<number>(LEVEL_CONFIG[0].id);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  // 按 levelId 分组，并在内部按 id 升序排序
  const groupedData = useMemo(() => {
    const groups: Record<number, QuestionBaseInfoResp[]> = {};

    LEVEL_CONFIG.forEach((cfg) => {
      groups[cfg.id] = [];
    });

    listResp.list.forEach((item) => {
      if (groups[item.levelId]) {
        groups[item.levelId].push(item);
      }
    });
    Object.keys(groups).forEach((key) => {
      groups[Number(key)].sort((a, b) => a.id - b.id);
    });
    return groups;
  }, [listResp.list]);

  const currentTabConfig = LEVEL_CONFIG.find((cfg) => cfg.id === activeTab);
  const currentTabList = currentTabConfig ? groupedData[currentTabConfig.id] || [] : [];
  const totalItems = currentTabList.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // 内存分页数据切片
  const pagedList = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return currentTabList.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentTabList, currentPage]);

  const handleTabChange = (id: number) => {
    setActiveTab(id);
    setCurrentPage(1);
    setOpenQuestionId(null);
  };

  // 存储详情信息
  const [viewInfoIng, setViewInfoIng] = useState<boolean>(false);
  const [viewInfoErr, setViewInfoErr] = useState<React.ReactNode>(null);
  const [infoRespMap, setInfoRespMap] = useState<Record<number, QuestionInfoResp>>({});

  // 查看详情
  const handleViewInfo = (questionId: number | null) => {
    setOpenQuestionId(questionId);

    if (questionId === null) {
      return;
    }

    if (infoRespMap[questionId]) {
      return;
    }

    setViewInfoIng(true);
    setViewInfoErr(null);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${questionId}`)
      .then((res) => {
        setInfoRespMap((prev) => ({ ...prev, [questionId]: res }));
      })
      .catch((err) => {
        setViewInfoErr(<SimpleAlert title="查看变式题详情出错" message={err.message} variant="default" />);
      })
      .finally(() => {
        setViewInfoIng(false);
      });
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList variant="line" className="flex">
          {LEVEL_CONFIG.map((cfg) => {
            const count = groupedData[cfg.id]?.length || 0;
            return (
              <TabsTrigger key={cfg.id} value={cfg.id}>
                <div className="flex items-end gap-2">
                  <div className="text-sm">{cfg.itemValue}</div>
                  <div className="leading-none pb-0.5">({count})</div>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {LEVEL_CONFIG.map((cfg) => {
          return (
            <TabsContent key={cfg.id} value={cfg.id}>
              <div className="space-y-2">
                {pagedList.map((question, index) => {
                  const isOpen = openQuestionId === question.id;
                  return (
                    <Collapsible key={question.id} open={isOpen} onOpenChange={() => handleViewInfo(isOpen ? null : question.id)}>
                      <div className={cn('overflow-hidden', isOpen ? 'border-blue-600 border border-dotted bg-green-50' : 'border-gray-300 border')}>
                        <div className="grid grid-cols-[85%_15%] items-center p-2">
                          <div className="flex gap-2 min-w-0 wrap-break-word">
                            <div className="tabular-nums font-semibold">{index + 1}.</div>
                            <TitleShow title={question.title} comment="" className="text-sm" />
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <CollapsibleTrigger
                              render={
                                <Button size="sm" variant="outline">
                                  {isOpen ? '收起' : viewInfoIng ? '查看中...' : '展开'}
                                </Button>
                              }
                            />
                          </div>
                        </div>

                        {/* 仅保留控制折叠展开的核心过渡动画样式 */}
                        <CollapsibleContent className="transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                          {viewInfoErr || (
                            <div className="border-t border-inherit p-2 bg-muted space-y-2">
                              <div className="space-y-1">
                                <div className={'flex items-center text-sm  gap-1.5 font-bold text-violet-600'}>
                                  <span className={'h-1.5 w-1.5 rounded-full bg-violet-500'} />
                                  题目全文
                                </div>
                                <div className="p-3 text-slate-700 border border-dashed border-blue-300">
                                  <SingleQuestionCommonPart
                                    pageSource={{ source: 'list' }}
                                    otherDictListRecord={otherDictListRecord}
                                    questionInfo={question}
                                    optBgClassName=""
                                  />
                                </div>
                              </div>

                              <AnswerInfo infoResp={infoRespMap[question.id] ?? null} />
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-1">
                  <Pagination>
                    <PaginationContent>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(pageNum);
                                setOpenQuestionId(null);
                              }}
                              isActive={currentPage === pageNum}
                              className={
                                currentPage === pageNum
                                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                                  : ''
                              }
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export { QuestionListShow, SimilarListShow };
