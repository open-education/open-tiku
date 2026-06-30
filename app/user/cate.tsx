import { CheckCircle2Icon, Pencil, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type { ChapterKnowledgeResp, CreateQuestionCateReq, QuestionCateResp } from "~/type/question-cate";
import { useQuestionCateList } from "~/util/fetcher";
import { httpClient } from "~/util/http";
import { StringValidator } from "~/util/string";

// 题型列表展示
interface QuestionCateListShowProps {
  ck: ChapterKnowledgeResp;
}
function QuestionCateListShow({ ck }: QuestionCateListShowProps) {
  const { data: cates = [], isLoading: catesLoading, error: catesErr, mutate: catesMutate } = useQuestionCateList(ck.id);

  // 题型相关操作
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [addReq, setAddReq] = useState<CreateQuestionCateReq>({
    relatedId: ck.id,
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

    // 如果主键为0则删除
    if (addReq.id === 0) {
      delete addReq.id;
    }

    httpClient
      .post<number>("/question-cate/add", addReq)
      .then((res) => {
        catesMutate();
        setSuccess(true);
        setDialogOpen(false);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="操作失败" message={err.message} />);
      })
      .finally(() => {
        setProcessIng(false);
      });
  };

  // 删除
  const [removeDialogOpen, setRemoveDialogOpen] = useState<boolean>(false);
  const [removeWarnInfo, setRemoveWarnInfo] = useState<React.ReactNode>("");
  const [removeSuccess, setRemoveSuccess] = useState<boolean>(false);

  const handleRemove = () => {
    setRemoveWarnInfo("");
    setRemoveSuccess(false);
    setRemoveDialogOpen(true);
  };

  const handleSubmitRemove = (item: QuestionCateResp) => {
    setRemoveWarnInfo("");
    setRemoveSuccess(false);

    httpClient
      .get(`/question-cate/remove/${item.id}`)
      .then((res) => {
        catesMutate();
        setRemoveSuccess(true);
        setRemoveDialogOpen(false);
      })
      .catch((err) => {
        setRemoveWarnInfo(<SimpleAlert title="删除题型失败" message={err.message} />);
      })
      .finally(() => {});
  };

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4 space-y-3 bg-gray-100">
      <div>
        <Button className="text-sm" variant="outline" onClick={handleAdd}>
          <Plus />
          新增题型
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Separator />
        </div>

        {/* 加载中 */}
        {useDelayedLoading(catesLoading) && <Loading />}

        {/* 错误信息 */}
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

                      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove()}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确定删除?</AlertDialogTitle>
                            <AlertDialogDescription>如果已经挂载了题目, 则不允许解除</AlertDialogDescription>
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
                                handleSubmitRemove(item);
                              }}
                              disabled={false}
                            >
                              删除
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
      </div>

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
  );
}

export { QuestionCateListShow };
