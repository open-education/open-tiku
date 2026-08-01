import { CheckCircle2Icon, Link2, Link2Off, List } from "lucide-react";
import React, { useMemo, useState } from "react";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { ChapterDropdownNav } from "~/common/nav";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type { Textbook } from "~/type/textbook";
import { useChapterKnowledgeList, useTextbooks } from "~/util/fetcher";
import { createTextbookPathDict } from "~/util/textbook-dict";
import { toast } from "sonner";
import type { CreateChapterKnowledgeReq, ChapterKnowledgeResp, RemoveChapterKnowledgeReq } from "~/type/question-cate";
import { httpClient } from "~/util/http";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { QuestionCateListShow } from "~/user/cate";

// 题型关联
export default function Index() {
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(7);
  const pathMap: Map<string, Textbook[]> = useMemo(() => {
    return createTextbookPathDict(textbooks);
  }, [textbooks]);

  // 当前选择的第7层菜单项
  const [currentTextbook, setCurrentTextbook] = useState<Textbook | null>(null);

  const { data: ckList = [], isLoading: ckListLoading, error: ckListErr, mutate: ckListMutate } = useChapterKnowledgeList(currentTextbook?.id || 0);

  const getTextbookName = (id: number): React.ReactNode => {
    const rows = pathMap.get(id.toString());
    if (!rows) return <span className="text-red-700">错误: 没有匹配到名称</span>;
    const current = rows[rows?.length - 1];
    if (current.pathDepth !== 7) <span className="text-red-700">错误: 不是第7级菜单</span>;
    return current.label;
  };

  // 关联相关操作
  const [relationDialogOpen, setRelationDialogOpen] = useState<boolean>(false);
  const [relationNodeNames, setRelationNodeNames] = useState<string[]>([]);
  const [relationTextbook, setRelationTextbook] = useState<Textbook | null>(null);
  const [relationSuccess, setRelationSuccess] = useState<boolean>(false);
  const [relationWarnInfo, setRelationWarnInfo] = useState<React.ReactNode>("");
  const [relationLinkIng, setRelationLinkIng] = useState<boolean>(false);

  // 打开关联对话框
  const handleLinkOpen = () => {
    if (!currentTextbook) {
      toast.error(<div className="text-red-700">请先选择第7级菜单后再建立关联</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setRelationTextbook(null);
    setRelationSuccess(false);
    setRelationWarnInfo("");
    setRelationLinkIng(false);
    setRelationNodeNames([]);

    setRelationDialogOpen(true);
  };

  const handleSubmitLink = () => {
    if (!currentTextbook) {
      toast.error(<div className="text-red-700">页面第7级菜单不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (currentTextbook.pathDepth !== 7) {
      toast.error(<div className="text-red-700">页面只支持第7级菜单做题型关联</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!relationTextbook) {
      toast.error(<div className="text-red-700">关联对话框第7级菜单不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (relationTextbook.pathDepth !== 7) {
      toast.error(<div className="text-red-700">关联对话框只支持第7级菜单做题型关联</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    // 检查类型是否匹配
    if (currentTextbook.pathType === relationTextbook.pathType) {
      toast.error(<div className="text-red-700">两个节点的类型相同, 不允许建立关联关系</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setRelationSuccess(false);
    setRelationWarnInfo("");
    setRelationLinkIng(true);

    const req: CreateChapterKnowledgeReq = {
      chapterId: currentTextbook.pathType === "chapter" ? currentTextbook.id : relationTextbook.id,
      knowledgeId: relationTextbook.pathType === "knowledge" ? relationTextbook.id : currentTextbook.id,
    };

    httpClient
      .post<number>("/chapter-knowledge/add", req)
      .then((res) => {
        ckListMutate();
        setRelationSuccess(true);
        setRelationDialogOpen(false);
      })
      .catch((err) => {
        setRelationWarnInfo(<SimpleAlert title="关联失败" message={err.message} />);
      })
      .finally(() => setRelationLinkIng(false));
  };

  // 解除关联关系
  const [removeSuccess, setRemoveSuccess] = useState<boolean>(false);
  const [removeWarnInfo, setRemoveWarnInfo] = useState<React.ReactNode>("");
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);

  const handleSubmitUnlink = (item: ChapterKnowledgeResp) => {
    const req: RemoveChapterKnowledgeReq = {
      ...item,
    };

    setRemoveSuccess(false);
    setRemoveWarnInfo("");

    httpClient
      .post("/chapter-knowledge/remove", req)
      .then((res) => {
        ckListMutate();
        setRemoveSuccess(true);
        setRemoveDialogOpen(false);
      })
      .catch((err) => setRemoveWarnInfo(<SimpleAlert title="解除关联失败" message={err.message} />))
      .finally(() => {});
  };

  // 设置选中的行标识
  const [selectCkId, setSelectCkId] = useState<number>(0);
  const rowClass = "flex items-center gap-4 px-4 py-2 border-b";

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">建立 章节/考点 第7级 关联关系, 挂载题型</CardTitle>
          <CardDescription className="text-sm">未关联请建立 章节/考点 的关联关系后才能挂载题型, 没有题型的请 新增题型</CardDescription>
          <CardAction>
            <Button className="text-sm" variant="outline" onClick={handleLinkOpen}>
              <Link2 />
              关联
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="text-sm">
            {/* 搜索选项 */}
            <div className="flex flex-col gap-3">
              {/* 章节/考点 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">章节/考点:</div>
                <div className="flex-1 min-w-0">
                  <ChapterDropdownNav
                    textbooks={textbooks}
                    onSelect={(selectedItems: Textbook[]) => {
                      if (!selectedItems) {
                        setCurrentTextbook(null);
                        return;
                      }
                      const current: Textbook = selectedItems[selectedItems.length - 1];
                      if (current.pathDepth !== 7) {
                        setCurrentTextbook(null);
                        return;
                      }

                      setCurrentTextbook(current);
                    }}
                    defaultSelectedKeys={[]}
                    placeholder="请选择章节/考点"
                    maxDepth={7}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Separator />
            </div>

            {/* 加载中 */}
            {useDelayedLoading(textbooksLoading || ckListLoading) && <Loading />}

            {/* 错误信息 */}
            {textbooksErr && <SimpleAlert title="7级菜单获取失败" message={textbooksErr.message} />}
            {ckListErr && <SimpleAlert title="章节考点关联关系获取失败" message={ckListErr.message} />}

            {/* 关联关系列表 */}
            <div>
              <div className={`${rowClass} text-sm font-medium text-muted-foreground`}>
                <div className="w-20 shrink-0">ID</div>
                <div className="flex-1">章节</div>
                <div className="flex-1">考点</div>
                <div className="w-45 shrink-0">操作</div>
              </div>

              {ckList.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">没有关联关系, 请手动关联后才能维护题型</div>
              ) : (
                ckList.map((item) => (
                  <div key={item.id} className="border-b last:border-b-0">
                    <Collapsible open={item.id === selectCkId}>
                      {/* 主行 */}
                      <div className={`${rowClass} px-4 py-2`}>
                        <div className="w-20 shrink-0 text-sm">{item.id}</div>
                        <div className="flex-1 text-sm">{getTextbookName(item.chapterId)}</div>
                        <div className="flex-1 text-sm">{getTextbookName(item.knowledgeId)}</div>
                        <div className="w-45 shrink-0 flex justify-end gap-2">
                          <CollapsibleTrigger
                            render={
                              <Button variant="ghost" size="sm" onClick={() => setSelectCkId(item.id === selectCkId ? 0 : item.id)}>
                                <List className="mr-1 h-4 w-4" />
                                题型
                              </Button>
                            }
                          />

                          <AlertDialog key={item.id} open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                            <AlertDialogTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                  <Link2Off className="h-4 w-4 mr-1" />
                                </Button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确定解除?</AlertDialogTitle>
                                <AlertDialogDescription>如果已经挂载了题型，则不允许解除; 解除后如需关联, 重新关联即可.</AlertDialogDescription>
                              </AlertDialogHeader>

                              {removeWarnInfo}

                              {removeSuccess && (
                                <div>
                                  <Alert>
                                    <CheckCircle2Icon />
                                    <AlertTitle>操作成功</AlertTitle>
                                    <AlertDescription>若页面没有发生变化请重新查询后确认</AlertDescription>
                                  </Alert>
                                </div>
                              )}

                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    handleSubmitUnlink(item);
                                  }}
                                  disabled={false}
                                >
                                  解除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {/* 折叠内容 */}
                      <Collapsible open={selectCkId === item.id}>
                        <CollapsibleContent className="px-4 pb-4">
                          <QuestionCateListShow ck={item} />
                        </CollapsibleContent>
                      </Collapsible>
                    </Collapsible>
                  </div>
                ))
              )}
            </div>

            {/* 关联对话框 */}
            <Dialog open={relationDialogOpen} onOpenChange={setRelationDialogOpen}>
              <DialogContent className="text-sm md:text-sm max-w-75 sm:max-w-162.5">
                <DialogHeader>
                  <DialogTitle className="text-base font-medium">关联</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-sm">选择待关联的 章节/考点 第7级菜单</DialogDescription>

                <div className="space-y-4 py-2 text-sm">
                  {/* 搜索选项 */}
                  <div className="flex flex-col gap-3">
                    {/* 章节/考点 */}
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      <div className="md:w-24 shrink-0 font-medium">章节/考点:</div>
                      <div className="flex-1 min-w-0">
                        <ChapterDropdownNav
                          textbooks={textbooks}
                          onSelect={(selectedItems: Textbook[]) => {
                            if (!selectedItems) {
                              setRelationTextbook(null);
                              setRelationNodeNames([]);
                              return;
                            }
                            const current: Textbook = selectedItems[selectedItems.length - 1];
                            if (current.pathDepth !== 7) {
                              setRelationTextbook(null);
                              setRelationNodeNames([]);
                              return;
                            }

                            setRelationTextbook(current);
                            setRelationNodeNames(selectedItems.map((item) => item.label));
                          }}
                          defaultSelectedKeys={[]}
                          placeholder="请选择章节/考点"
                          maxDepth={7}
                          longText={true}
                        />
                      </div>
                    </div>
                  </div>

                  <div>{relationWarnInfo}</div>

                  {/* 完整的节点信息 */}
                  <div className="text-wrap">
                    <div className="font-bold">你选择的节点列表: </div>
                    {relationNodeNames.map((name, idx) => {
                      return <div key={idx}>{name}</div>;
                    })}
                  </div>

                  {/* 预建立的关联关系是 */}
                  <div className="text-wrap">
                    <div className="font-bold text-blue-700">待建立的关联关系是： </div>
                    <div>
                      页面题型已选择的类型是: <span className="font-bold underline">名称: </span>
                      {currentTextbook?.label}
                    </div>
                    <div>
                      你当前选择的类型是: <span className="font-bold underline">名称: </span>
                      {relationTextbook?.label}
                    </div>
                    <div className="font-bold text-red-700">请检查是否匹配</div>
                  </div>

                  {/* 操作结果 */}
                  {relationSuccess && (
                    <div>
                      <Alert>
                        <CheckCircle2Icon />
                        <AlertTitle>操作成功</AlertTitle>
                        <AlertDescription>若页面没有发生变化请重新查询后确认</AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => {
                      setRelationDialogOpen(false);
                    }}
                  >
                    取消
                  </Button>
                  <Button className="text-sm" onClick={handleSubmitLink} disabled={relationLinkIng}>
                    {relationLinkIng ? "关联中..." : "关联"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
