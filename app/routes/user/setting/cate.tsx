import { CheckCircle2Icon, Link2, Link2Off, Pencil, Plus, Trash, Trash2 } from "lucide-react";
import React, { use, useState } from "react";
import { ChapterDropdownNav } from "~/common/nav";
import { Button } from "~/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import type { CreateQuestionCateReq, QuestionCateResp, RemoveChapterKnowledgeReq } from "~/type/question-cate";
import type { Textbook } from "~/type/textbook";
import { useQuestionCateList, useQuestionChaptes, useQuestionKnowledges, useTextbooks } from "~/util/fetcher";
import { toast } from "sonner";
import { StringValidator } from "~/util/string";
import { httpClient } from "~/util/http";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { SimpleAlert } from "~/common/alert";
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

// 题型维护
export default function Index() {
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(7);

  const [sevenLevelId, setSevenLevelId] = useState<number>(0);
  const { data: cates = [], isLoading: catesLoading, error: catesErr, mutate: catesMutate } = useQuestionCateList(sevenLevelId);

  // 根据选择的第7层节点决定获取章节/考点
  const [getChapter, setGetChapter] = useState<boolean>(false);

  const {
    data: relationShips = [],
    isLoading: relationShipsLoading,
    error: relationShipsErr,
    mutate: relationShipsMutate,
  } = getChapter ? useQuestionChaptes(sevenLevelId) : useQuestionKnowledges(sevenLevelId);

  // 题型相关操作
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [addReq, setAddReq] = useState<CreateQuestionCateReq>({
    relatedId: 0,
    label: "",
    sortOrder: 1,
  });
  const updateAddReq = (key: keyof CreateQuestionCateReq, value: string | number) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  const [processIng, setProcessIng] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");

  // 新增
  const handleAdd = () => {
    setAddReq({ ...addReq, id: 0, label: "", sortOrder: 1 });
    setWarnInfo("");
    setSuccess(false);
    setDialogOpen(true);
  };

  // 编辑
  const handleEdit = (item: QuestionCateResp) => {
    setAddReq({ ...item });
    setWarnInfo("");
    setSuccess(false);
    setDialogOpen(true);
  };

  // 删除
  const handleDelete = (item: QuestionCateResp) => {
    alert("暂未实现");
  };

  const handleSubmit = () => {
    if (addReq.relatedId <= 0) {
      toast.error(<div className="text-red-700">第7级菜单不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    if (!StringValidator.isNonEmpty(addReq.label)) {
      toast.error(<div className="text-red-700">题型名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setProcessIng(true);
    setWarnInfo("");
    setSuccess(false);

    httpClient
      .post<number>("/question-cate/add", addReq)
      .then((res) => {
        catesMutate();
        setSuccess(true);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="操作失败" message={err.message} />);
      })
      .finally(() => {
        setProcessIng(false);
      });
  };

  // 关联关系相关操作
  const [relationDialogOpen, setRelationDialogOpen] = useState<boolean>(false);
  const [relationWarnInfo, setRelationWarnInfo] = useState<React.ReactNode>("");
  const [relationSuccess, setRelationSuccess] = useState<boolean>(false);
  const [relationing, setRelationing] = useState<boolean>(false);

  // 关联
  const handleLink = () => {
    setRelationDialogOpen(true);
  };

  const handleLinkSubmit = () => {};

  // 取消关联
  const [removeSuccess, setRemoveSuccess] = useState<boolean>(false);
  const [removing, setRemoving] = useState<boolean>(false);
  const [removeWarnInfo, setRemoveWarnInfo] = useState<React.ReactNode>("");

  // 解除关联
  const handleUnlink = (item: Textbook) => {
    const req: RemoveChapterKnowledgeReq = {
      chapterId: getChapter ? item.id : sevenLevelId,
      knowledgeId: getChapter ? sevenLevelId : item.id,
    };

    setRemoveSuccess(false);
    setRemoving(false);
    setRemoveWarnInfo("");

    httpClient
      .post("/chapter-knowledge/remove", req)
      .then((res) => {
        relationShipsMutate();
        setRemoveSuccess(true);
        setRemoving(true);
      })
      .catch((err) => setRemoveWarnInfo(<SimpleAlert title="解除失败" message={err.message} />))
      .finally(() => {});
  };

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4">
      {/* 查看题型 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">关联题型</CardTitle>
            <CardDescription className="text-sm">选择第 7 层菜单查看关联题型, 没有题型请新增题型</CardDescription>
            <CardAction>
              <Button className="text-sm" variant="outline" onClick={handleAdd}>
                <Plus />
                新增题型
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
                          setSevenLevelId(0);
                          updateAddReq("relatedId", 0);
                          setGetChapter(false);
                          return;
                        }
                        const current: Textbook = selectedItems[selectedItems.length - 1];
                        setSevenLevelId(current.id);
                        updateAddReq("relatedId", current.id);
                        setGetChapter(current.pathType !== "chapter");
                      }}
                      defaultSelectedKeys={[]}
                      placeholder="请选择章节/考点"
                      maxDepth={7}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Separator />
              </div>

              {/* 加载中 */}
              {useDelayedLoading(textbooksLoading || catesLoading) && <Loading />}

              {/* 错误信息 */}
              {textbooksErr && <SimpleAlert title="7级菜单获取失败" message={textbooksErr.message} />}
              {catesErr && <SimpleAlert title="题型列表获取失败" message={catesErr.message} />}

              <div>{warnInfo}</div>

              {/* 题型列表 */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-sm">ID</TableHead>
                      <TableHead className="text-sm">Key</TableHead>
                      <TableHead className="text-sm">名称</TableHead>
                      <TableHead className="text-sm">顺序</TableHead>
                      <TableHead className="text-sm">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                          暂无数据，点击 新增题型 添加
                        </TableCell>
                      </TableRow>
                    ) : (
                      cates.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.id}</TableCell>
                          <TableCell className="text-sm">{item.key}</TableCell>
                          <TableCell className="text-sm">{item.label}</TableCell>
                          <TableCell className="text-sm">{item.sortOrder}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 题型操作对话框 */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-base font-medium">{addReq.id && addReq.id > 0 ? "编辑" : "添加"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* 名称 */}
              <div className="space-y-1">
                <label className="text-sm leading-none">题型名称</label>
                <Input
                  className="text-sm md:text-sm"
                  value={addReq.label}
                  onChange={(e) => updateAddReq("label", e.target.value)}
                  placeholder="请输入题型名称"
                />
              </div>

              {/* 顺序 */}
              <div className="space-y-1">
                <label className="text-sm leading-none">顺序</label>
                <Input
                  className="text-sm md:text-sm"
                  type="number"
                  min="0"
                  value={addReq.sortOrder}
                  onChange={(e) => updateAddReq("sortOrder", Number(e.target.value))}
                />
              </div>

              {/* 操作结果 */}
              {success && (
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
                  setDialogOpen(false);
                }}
              >
                取消
              </Button>
              <Button className="text-sm" onClick={handleSubmit} disabled={processIng}>
                {addReq.id && addReq.id > 0 ? (processIng ? "更新中..." : "更新") : processIng ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 已关联的信息列表 */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">已关联的{getChapter ? "章节" : "考点"}</CardTitle>
            <CardDescription className="text-sm">未关联请建立 章节/考点 的关联关系</CardDescription>
            <CardAction>
              <Button className="text-sm" variant="outline" onClick={handleLink}>
                <Link2 />
                关联
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div>
              {/* 加载中 */}
              {useDelayedLoading(relationShipsLoading) && <Loading />}

              {/* 错误信息 */}
              {relationShipsErr && <SimpleAlert title="关联关系获取失败" message={relationShipsErr.message} />}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-sm">ID</TableHead>
                    <TableHead className="text-sm">Key</TableHead>
                    <TableHead className="text-sm">名称</TableHead>
                    <TableHead className="text-sm">顺序</TableHead>
                    <TableHead className="text-sm">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground text-sm">
                        暂无数据，点击 关联 去建立关联关系
                      </TableCell>
                    </TableRow>
                  ) : (
                    relationShips.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm">{item.id}</TableCell>
                        <TableCell className="text-sm">{item.key}</TableCell>
                        <TableCell className="text-sm">{item.label}</TableCell>
                        <TableCell className="text-sm">{item.sortOrder}</TableCell>
                        <TableCell>
                          <AlertDialog>
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
                                <AlertDialogDescription>解除后如需关联, 重新关联即可.</AlertDialogDescription>
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
                                <AlertDialogAction onClick={() => handleUnlink(item)} disabled={removing}>
                                  {removing ? "解除中..." : "解除"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 关联对话框 */}
        <Dialog open={relationDialogOpen} onOpenChange={setRelationDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-base font-medium">关联 {getChapter ? "章节" : "考点"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
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
                          return;
                        }
                        const current: Textbook = selectedItems[selectedItems.length - 1];
                      }}
                      defaultSelectedKeys={[]}
                      placeholder="请选择章节/考点"
                      maxDepth={7}
                    />
                  </div>
                </div>
              </div>

              <div>{relationWarnInfo}</div>

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
                  setDialogOpen(false);
                }}
              >
                取消
              </Button>
              <Button className="text-sm" onClick={handleLinkSubmit} disabled={relationing}>
                关联
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
