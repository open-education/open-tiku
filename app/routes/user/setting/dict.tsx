import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { ChapterDropdownNav } from "~/common/nav";
import { OtherDictSelect } from "~/common/question/tag";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type { Textbook, TextbookOtherDict } from "~/type/textbook";
import { useQuestionTags, useQuestionTypes, useTextbooks } from "~/util/fetcher";
import { StringValidator } from "~/util/string";
import { toast } from "sonner";
import { httpClient } from "~/util/http";

// 其它字典维护
export default function Index() {
  const [addReq, setAddReq] = useState<TextbookOtherDict>({
    id: 0,
    textbookId: 0,
    typeCode: "",
    itemValue: "",
    sortOrder: 0,
    isSelect: false,
  });
  const updateAddReq = (key: keyof TextbookOtherDict, value: number | string | boolean) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 5层导航信息
  const { data: textbooks = [], isLoading: textbooksLoading, error: textbooksErr } = useTextbooks(2);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [processIng, setProcessIng] = useState<boolean>(false);

  const {
    data: questionTypes = [],
    isLoading: questionTypesLoading,
    error: questionTypesErr,
    mutate: questionTypesMutate,
  } = useQuestionTypes(addReq.typeCode === "question_type" ? addReq.textbookId : 0);

  const {
    data: questionTags = [],
    isLoading: questionTagsLoading,
    error: questionTagsErr,
    mutate: questionTagsMutate,
  } = useQuestionTags(addReq.typeCode === "question_tag" ? addReq.textbookId : 0);

  // 点击添加按钮,  新增需要默认值
  const handleAdd = () => {
    setAddReq({ ...addReq, id: 0, itemValue: "", sortOrder: 0, isSelect: false });
    setDialogOpen(true);
  };

  // 点击编辑按钮, 需要用当前行数据初始化
  const handleEdit = (item: TextbookOtherDict) => {
    setAddReq({ ...addReq, id: item.id, itemValue: item.itemValue, sortOrder: item.sortOrder, isSelect: item.isSelect });
    setDialogOpen(true);
  };

  // 提交数据
  const handleSubmit = () => {
    if (addReq.textbookId <= 0) {
      toast.error(<div className="text-red-700">科目不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.typeCode)) {
      toast.error(<div className="text-red-700">类型不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.itemValue)) {
      toast.error(<div className="text-red-700">名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    httpClient
      .post("other/dict/add", addReq)
      .then((res) => {
        // 添加成功则清除表单其它项
        setAddReq({ ...addReq, id: 0, itemValue: "", sortOrder: 0, isSelect: false });
        setDialogOpen(false);
        // 同时要重新刷新字典列表
        if (addReq.typeCode === "question_type") {
          questionTypesMutate();
        } else {
          questionTagsMutate();
        }
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">{err.message}</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
      })
      .finally(() => {});
  };

  // 删除数据
  const handleDelete = (id: number) => {
    toast.error(<div className="text-red-700">暂不支持删除</div>, {
      duration: Infinity,
      action: {
        label: "关闭",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="px-4 pt-3 sm:px-16 sm:pt-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">其它字典管理</CardTitle>
          <Button className="text-sm" onClick={handleAdd} variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            新增
          </Button>
        </CardHeader>
        <CardContent>
          {/* 搜索选项 */}
          <div className="text-base">
            <div className="flex flex-col gap-3">
              {/* 章节/考点 */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">科目:</div>
                <div className="flex-1 min-w-0">
                  <ChapterDropdownNav
                    textbooks={textbooks}
                    onSelect={(selectedItems: Textbook[]) => {
                      if (!selectedItems) {
                        updateAddReq("textbookId", 0);
                        return;
                      }
                      const current: Textbook = selectedItems[selectedItems.length - 1];
                      updateAddReq("textbookId", current.id);
                    }}
                    defaultSelectedKeys={[]}
                    placeholder="请选择科目"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">类型:</div>
                <div className="flex-1 min-w-0">
                  <OtherDictSelect defaultValue={addReq.typeCode} onSelect={(val) => updateAddReq("typeCode", val)} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Separator />
          </div>

          {/* 错误提示 */}
          {textbooksErr && <SimpleAlert title="科目获取失败" message={textbooksErr.message} />}
          {questionTypesErr && <SimpleAlert title="题型获取失败" message={questionTypesErr.message} />}
          {questionTagsErr && <SimpleAlert title="标签获取失败" message={questionTagsErr.message} />}

          {/* 加载中 */}
          {useDelayedLoading(textbooksLoading || questionTypesLoading || questionTagsLoading) && <Loading />}

          {/* 表格 */}
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">ID</TableHead>
                  <TableHead className="text-sm">类型</TableHead>
                  <TableHead className="text-sm">名称</TableHead>
                  <TableHead className="text-sm">顺序</TableHead>
                  <TableHead className="text-sm">是否为选择题</TableHead>
                  <TableHead className="text-sm">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <OtherDictListShow
                  list={addReq.typeCode === "question_type" ? questionTypes : addReq.typeCode === "question_tag" ? questionTags : []}
                  onEdit={(val) => handleEdit(val)}
                  onDelete={(id) => handleDelete(id)}
                />
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">{addReq.id > 0 ? "编辑" : "添加"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 名称 */}
            <div className="space-y-1">
              <label className="text-sm leading-none">字典名称</label>
              <Input
                className="text-sm md:text-sm"
                value={addReq.itemValue}
                onChange={(e) => updateAddReq("itemValue", e.target.value)}
                placeholder="例如 选择题"
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

            {/* 是否为选择题 */}
            <div className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <label className="text-sm">是否为选择题</label>
              </div>
              <Switch checked={addReq.isSelect} onCheckedChange={(val) => updateAddReq("isSelect", val)} />
            </div>
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
              {addReq.id > 0 ? (processIng ? "更新中..." : "更新") : processIng ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 展示题型和标签
interface OtherDictListShowProps {
  list: TextbookOtherDict[];
  onEdit: (val: TextbookOtherDict) => void;
  onDelete: (val: number) => void;
}
function OtherDictListShow({ list, onEdit, onDelete }: OtherDictListShowProps) {
  return (
    <>
      {list.length === 0 ? (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
            暂无数据，点击 新增 添加
          </TableCell>
        </TableRow>
      ) : (
        list.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="text-sm">{item.id}</TableCell>
            <TableCell className="text-sm">{item.typeCode === "question_type" ? "题型" : "标签"}</TableCell>
            <TableCell className="text-sm">{item.itemValue}</TableCell>
            <TableCell className="text-sm">{item.sortOrder}</TableCell>
            <TableCell className="text-sm">{item.isSelect ? "是" : "否"}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  );
}
