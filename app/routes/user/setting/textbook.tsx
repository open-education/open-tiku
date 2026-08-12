import type { Route } from "./+types/textbook";
import { CheckCircle2Icon, ChevronsUpDown, Edit, InfoIcon, Menu, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { type KeyedMutator } from "swr";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type { Textbook, CreateTextbookReq } from "~/type/textbook";
import { useTextbooks, useTextbookLevel } from "~/util/fetcher";
import { httpClient } from "~/util/http";
import { StringConst, StringValidator } from "~/util/string";

/// 网站首页顶部和底部框架

export function meta({}: Route.MetaArgs) {
  return [
    { title: "系统设置-章节/考点" },
    {
      name: "description",
      content: "个人中心, 系统设置, 维护7级教材目录章节和考点层级关系",
    },
  ];
}

// 教材层级信息构建维护
export default function Index() {
  // 第一级菜单
  const [firstCollapsibleOpen, setFirstCollapsibleOpen] = useState<boolean>(true);
  const firstLevelName = "第 1 级菜单";
  const { data: firstLevels = [], isLoading: firstLevelsLoading, error: firstLevelsErr, mutate: firstLevelsMutate } = useTextbooks(1);

  // 第二级菜单
  const [secondCollapsibleOpen, setSecondCollapsibleOpen] = useState<boolean>(true);
  const [secondLevelParentId, setSecondLevelParentId] = useState<number>(0);
  const secondLevelName = "第 2 级菜单";
  const {
    data: secondLevels = [],
    isLoading: secondLevelsLoading,
    error: secondLevelsErr,
    mutate: secondLevelsMutate,
  } = useTextbookLevel(secondLevelParentId);

  // 第三级菜单
  const [thirdCollapsibleOpen, setThirdCollapsibleOpen] = useState<boolean>(true);
  const [thirdLevelParentId, setThildLevelParentId] = useState<number>(0);
  const thirdLevelName = "第 3 级菜单";
  const {
    data: thirdLevels = [],
    isLoading: thirdLevelsLoading,
    error: thirdLevelsErr,
    mutate: thirdLevelsMutate,
  } = useTextbookLevel(thirdLevelParentId);

  // 第四级菜单
  const [forthCollapsibleOpen, setForthCollapsibleOpen] = useState<boolean>(true);
  const [forthLevelParentId, setForthLevelParentId] = useState<number>(0);
  const forthLevelName = "第 4 级菜单";
  const {
    data: forthLevels = [],
    isLoading: forthLevelsLoading,
    error: forthLevelsErr,
    mutate: forthLevelsMutate,
  } = useTextbookLevel(forthLevelParentId);

  // 第五级菜单
  const [fifthCollapsibleOpen, setFifthCollapsibleOpen] = useState<boolean>(true);
  const [fifthLevelParentId, setFifthLevelParentId] = useState<number>(0);
  const fifthLevelName = "第 5 级菜单";
  const {
    data: fifthLevels = [],
    isLoading: fifthLevelsLoading,
    error: fifthLevelsErr,
    mutate: fifthLevelsMutate,
  } = useTextbookLevel(fifthLevelParentId);

  // 第六级菜单
  const [sixthCollapsibleOpen, setSixthCollapsibleOpen] = useState<boolean>(true);
  const [sixthLevelParentId, setSixthLevelParentId] = useState<number>(0);
  const sixthLevelName = "第 6 级菜单";
  const {
    data: sixthLevels = [],
    isLoading: sixthLevelsLoading,
    error: sixthLevelsErr,
    mutate: sixthLevelsMutate,
  } = useTextbookLevel(sixthLevelParentId);

  // 第七级菜单
  const [seventhCollapsibleOpen, setSeventhCollapsibleOpen] = useState<boolean>(true);
  const [seventhLevelParentId, setSeventhLevelParentId] = useState<number>(0);
  const seventhLevelName = "第 7 级菜单";
  const {
    data: seventhLevels = [],
    isLoading: seventhLevelsLoading,
    error: seventhLevelsErr,
    mutate: seventhLevelsMutate,
  } = useTextbookLevel(seventhLevelParentId);

  // 对话框弹框
  const [dailogOpen, setDailogOpen] = useState<boolean>(false);
  const [dailogTitle, setDailogTitle] = useState<string>("");
  const [dailogDesc, setDailogDesc] = useState<string>("");
  // 需要自己包含操作按钮
  const [dailogContent, setDailogContent] = useState<React.ReactNode>("");

  // 添加菜单
  const handleAdd = (levelName: string, pathDepth: number, path: string, mutateCallback: KeyedMutator<Textbook[]>, parentId?: number) => {
    setDailogOpen(true);
    setDailogTitle("添加菜单");
    setDailogDesc(`追加 ${levelName} 的子菜单`);
    setDailogContent(<Add parentId={parentId} pathDepth={pathDepth} path={path} onClose={setDailogOpen} mutateCallback={mutateCallback} />);
  };

  // 编辑菜单
  const handleEdit = (levelName: string, pathDepth: number, item: Textbook, mutateCallback: KeyedMutator<Textbook[]>, parentId?: number) => {
    setDailogOpen(true);
    setDailogTitle("编辑菜单");
    setDailogDesc(`编辑 ${levelName} 的子菜单`);
    setDailogContent(<Add parentId={parentId} pathDepth={pathDepth} item={item} onClose={setDailogOpen} mutateCallback={mutateCallback} />);
  };

  // 删除菜单
  const handleDelete = (levelName: string, item: Textbook, mutateCallback: KeyedMutator<Textbook[]>) => {
    setDailogOpen(true);
    setDailogTitle("删除菜单");
    setDailogDesc(`删除 ${levelName} 的子菜单`);
    setDailogContent(<Delete item={item} onClose={setDailogOpen} mutateCallback={mutateCallback} />);
  };

  return (
    <div className="p-4">
      {/* 加载中提示 */}
      {useDelayedLoading(
        firstLevelsLoading ||
          secondLevelsLoading ||
          thirdLevelsLoading ||
          forthLevelsLoading ||
          fifthLevelsLoading ||
          sixthLevelsLoading ||
          seventhLevelsLoading,
      ) && <Loading />}

      {/* 错误提示 */}
      {firstLevelsErr && <SimpleAlert title="学段信息获取失败" message={firstLevelsErr.message} />}
      {secondLevelsErr && <SimpleAlert title="学科信息获取失败" message={secondLevelsErr.message} />}
      {thirdLevelsErr && <SimpleAlert title="章节/考点信息获取失败" message={thirdLevelsErr.message} />}
      {forthLevelsErr && <SimpleAlert title="出版社/考点名称获取失败" message={forthLevelsErr.message} />}
      {fifthLevelsErr && <SimpleAlert title="教材/考点名称获取失败" message={fifthLevelsErr.message} />}
      {sixthLevelsErr && <SimpleAlert title="教材章节/考点名称获取失败" message={sixthLevelsErr.message} />}
      {seventhLevelsErr && <SimpleAlert title="教材小节/考点名称获取失败" message={seventhLevelsErr.message} />}

      <div className="space-y-6 min-h-200 p-4 bg-gray-50">
        <div className="text-base font-bold">七级菜单维护</div>

        <Separator />

        <div>
          <Level
            open={firstCollapsibleOpen}
            setOpen={setFirstCollapsibleOpen}
            levelName={firstLevelName}
            levelDesc="公共节点: 学段"
            levels={firstLevels}
            onClear={(id) => {
              setSecondLevelParentId(id);

              // 清空子层菜单展示
              setThildLevelParentId(0);
              setForthLevelParentId(0);
              setFifthLevelParentId(0);
              setSixthLevelParentId(0);
              setSeventhLevelParentId(0);
            }}
            onEdit={(item) => handleEdit(firstLevelName, 1, item, firstLevelsMutate)}
            onDelete={(item) => handleDelete(firstLevelName, item, firstLevelsMutate)}
            onAdd={() => handleAdd(firstLevelName, 1, "", firstLevelsMutate)}
          />
        </div>

        <div>
          <Level
            open={secondCollapsibleOpen}
            setOpen={setSecondCollapsibleOpen}
            levelName={secondLevelName}
            levelDesc="公共节点: 科目"
            levels={secondLevels}
            onClear={(id) => {
              if (secondLevelParentId !== id) {
                setThildLevelParentId(id);

                // 清空子层菜单
                setForthLevelParentId(0);
                setFifthLevelParentId(0);
                setSixthLevelParentId(0);
                setSeventhLevelParentId(0);
              }
            }}
            onEdit={(item) => handleEdit(secondLevelName, 2, item, secondLevelsMutate, secondLevelParentId)}
            onDelete={(item) => handleDelete(secondLevelName, item, secondLevelsMutate)}
            onAdd={() => handleAdd(secondLevelName, 2, `${secondLevelParentId}`, secondLevelsMutate, secondLevelParentId)}
          />
        </div>

        <div>
          <Level
            open={thirdCollapsibleOpen}
            setOpen={setThirdCollapsibleOpen}
            levelName="第 3 级菜单"
            levelDesc="章节/考点"
            levels={thirdLevels}
            onClear={(id) => {
              if (thirdLevelParentId !== id) {
                setForthLevelParentId(id);

                // 清空子层菜单
                setFifthLevelParentId(0);
                setSixthLevelParentId(0);
                setSeventhLevelParentId(0);
              }
            }}
            onEdit={(item) => handleEdit(thirdLevelName, 3, item, thirdLevelsMutate, thirdLevelParentId)}
            onDelete={(item) => handleDelete(thirdLevelName, item, thirdLevelsMutate)}
            onAdd={() => handleAdd(thirdLevelName, 3, `${secondLevelParentId}/${thirdLevelParentId}`, thirdLevelsMutate, thirdLevelParentId)}
          />
        </div>

        <div>
          <Level
            open={forthCollapsibleOpen}
            setOpen={setForthCollapsibleOpen}
            levelName="第 4 级菜单"
            levelDesc="章节/考点"
            levels={forthLevels}
            onClear={(id) => {
              if (forthLevelParentId !== id) {
                setFifthLevelParentId(id);

                // 清空子层菜单
                setSixthLevelParentId(0);
                setSeventhLevelParentId(0);
              }
            }}
            onEdit={(item) => handleEdit(forthLevelName, 4, item, forthLevelsMutate, forthLevelParentId)}
            onDelete={(item) => handleDelete(forthLevelName, item, forthLevelsMutate)}
            onAdd={() =>
              handleAdd(
                forthLevelName,
                4,
                `${secondLevelParentId}/${thirdLevelParentId}/${forthLevelParentId}`,
                forthLevelsMutate,
                forthLevelParentId,
              )
            }
          />
        </div>

        <div>
          <Level
            open={fifthCollapsibleOpen}
            setOpen={setFifthCollapsibleOpen}
            levelName="第 5 级菜单"
            levelDesc="章节/考点"
            levels={fifthLevels}
            onClear={(id) => {
              if (fifthLevelParentId !== id) {
                setSixthLevelParentId(id);

                // 清空子层菜单
                setSeventhLevelParentId(0);
              }
            }}
            onEdit={(item) => handleEdit(fifthLevelName, 5, item, fifthLevelsMutate, fifthLevelParentId)}
            onDelete={(item) => handleDelete(fifthLevelName, item, fifthLevelsMutate)}
            onAdd={() =>
              handleAdd(
                fifthLevelName,
                5,
                `${secondLevelParentId}/${thirdLevelParentId}/${forthLevelParentId}/${fifthLevelParentId}`,
                fifthLevelsMutate,
                fifthLevelParentId,
              )
            }
          />
        </div>

        <div>
          <Level
            open={sixthCollapsibleOpen}
            setOpen={setSixthCollapsibleOpen}
            levelName="第 6 级菜单"
            levelDesc="章节/考点"
            levels={sixthLevels}
            onClear={(id) => {
              if (sixthLevelParentId !== id) {
                setSeventhLevelParentId(id);
              }
            }}
            onEdit={(item) => handleEdit(sixthLevelName, 6, item, sixthLevelsMutate, sixthLevelParentId)}
            onDelete={(item) => handleDelete(sixthLevelName, item, sixthLevelsMutate)}
            onAdd={() =>
              handleAdd(
                sixthLevelName,
                6,
                `${secondLevelParentId}/${thirdLevelParentId}/${forthLevelParentId}/${fifthLevelParentId}/${sixthLevelParentId}`,
                sixthLevelsMutate,
                sixthLevelParentId,
              )
            }
          />
        </div>

        <div>
          <Level
            open={seventhCollapsibleOpen}
            setOpen={setSeventhCollapsibleOpen}
            levelName="第 7 级菜单"
            levelDesc="章节/考点"
            levels={seventhLevels}
            onClear={(id) => {}}
            onEdit={(item) => handleEdit(seventhLevelName, 7, item, seventhLevelsMutate, seventhLevelParentId)}
            onDelete={(item) => handleDelete(seventhLevelName, item, seventhLevelsMutate)}
            onAdd={() =>
              handleAdd(
                seventhLevelName,
                7,
                `${secondLevelParentId}/${thirdLevelParentId}/${forthLevelParentId}/${fifthLevelParentId}/${sixthLevelParentId}/${seventhLevelParentId}`,
                seventhLevelsMutate,
                seventhLevelParentId,
              )
            }
          />
        </div>
      </div>

      {/* 通用对话框 */}
      <Dialog open={dailogOpen} onOpenChange={setDailogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-bold">{dailogTitle}</DialogTitle>
            <DialogDescription className="text-sm">{dailogDesc}</DialogDescription>
          </DialogHeader>
          {dailogContent}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 管理一层菜单的内容
interface LevelProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  levelName: string;
  levelDesc: string;
  levels: Textbook[];
  onClear: (id: number) => void;
  onEdit: (value: Textbook) => void;
  onDelete: (value: Textbook) => void;
  onAdd: () => void;
}
function Level({ open, setOpen, levelName, levelDesc, levels, onClear, onAdd, onEdit, onDelete }: LevelProps) {
  // 记录当前选中的 Item ID
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col gap-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold">{levelName}</CardTitle>
          <CardDescription className="text-sm">{levelDesc}</CardDescription>
          <CardAction>
            <CollapsibleTrigger
              render={
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronsUpDown />
                  <span className="sr-only">Toggle details</span>
                </Button>
              }
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <CollapsibleContent className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-3">
              {levels.map((item) => {
                return (
                  <Item
                    key={item.id}
                    isSelected={selectedId === item.id}
                    item={item}
                    onViewList={(id) => {
                      setSelectedId(id);
                      onClear(id);
                    }}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                  />
                );
              })}
            </div>
          </CollapsibleContent>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="text-sm" onClick={() => onAdd()}>
            <Plus />
            新建菜单
          </Button>
        </CardFooter>
      </Card>
    </Collapsible>
  );
}

// 一个菜单内容
interface ItemProps {
  isSelected?: boolean; // 新增：是否选中
  item: Textbook; // 显示菜单详情
  onViewList: (val: number) => void; // 查看子菜单回调函数
  onEdit: () => void;
  onDelete: () => void;
}
function Item({ isSelected = false, item, onViewList, onEdit, onDelete }: ItemProps) {
  return (
    <Card className="w-80 transition-colors duration-200">
      <CardHeader>
        <CardTitle className="text-sm font-bold">{item.label}</CardTitle>
        <CardDescription className="text-sm">排序: {item.sortOrder}</CardDescription>
        <CardAction>
          {item.pathDepth < 7 && (
            <Button className="text-sm" variant={isSelected ? "default" : "outline"} onClick={() => onViewList(item.id)}>
              <Menu />
              子菜单
            </Button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>标识: {item.id}</div>
          <div>父标识: {item.parentId}</div>
          <div>深度: {item.pathDepth}</div>
          <div>
            类型:{" "}
            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {StringConst.textbookPathTypeNames.get(item.pathType) || ""}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-3">
          <Button className="text-sm" variant="outline" onClick={() => onEdit()}>
            <Edit />
            编辑
          </Button>

          <Button className="text-sm" variant="outline" onClick={() => onDelete()}>
            <X />
            删除
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// 添加/编辑菜单
interface AddProps {
  parentId?: number; // 父级标识, 第一级不传
  pathDepth: number; // 深度
  path?: string; // 记录根节点至当前节点的父路径
  item?: Textbook; // 现有菜单值
  onClose: (val: boolean) => void; // 取消暂时什么都不做
  mutateCallback?: KeyedMutator<Textbook[]>; // 操作完毕后是否需要请求回调刷新缓存
}
function Add({ parentId, pathDepth, path = "", item, onClose, mutateCallback }: AddProps) {
  // 添加和编辑请求
  const defaultAddReq: CreateTextbookReq = item
    ? { ...item }
    : {
        label: "",
        sortOrder: 1,
        pathDepth,
        path,
      };
  const [addReq, setAddReq] = useState<CreateTextbookReq>(defaultAddReq);
  const updateAddReq = (key: keyof CreateTextbookReq, val: string | number) => {
    setAddReq((prev) => ({ ...prev, [key]: val }));
  };

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");
  const [submittIng, setSubmittIng] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // 保存菜单
  const handleSubmit = () => {
    // 存在 item 时全部用 item 的值
    if (!item && parentId) {
      addReq.parentId = parentId;
    }

    if (!StringValidator.isNonEmpty(addReq.label)) {
      setWarnInfo(<SimpleAlert title="必填检查" message="名称为空" />);
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.pathType)) {
      setWarnInfo(<SimpleAlert title="必填检查" message="类型为空" />);
      return;
    }
    // 前两层类型为 common
    if (pathDepth === 1 || pathDepth === 2) {
      if (addReq.pathType !== "common") {
        setWarnInfo(<SimpleAlert title="必填检查" message="前2层节点类型只能为 公共" />);
        return;
      }
    }

    setSubmittIng(true);
    setSuccess(false);
    setWarnInfo("");

    httpClient
      .post("/textbook/add", addReq)
      .then((res) => {
        // 刷新列表
        mutateCallback?.();
        setSuccess(true);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="操作失败" message={err.message} />);
      })
      .finally(() => {
        setSubmittIng(false);
      });
  };

  return (
    <div className="space-y-4 py-2">
      {/* 提示信息 */}
      <div>{warnInfo}</div>

      {/* 名称 */}
      <div className="space-y-1">
        <label className="text-sm leading-none">名称</label>
        <Input
          className="text-sm md:text-sm"
          value={addReq.label}
          onChange={(e) => updateAddReq("label", e.target.value)}
          placeholder="请输入菜单名称"
        />
      </div>

      {/* 菜单类型 */}
      <div className="space-y-1">
        <label className="text-sm leading-none">类型</label>
        <PathTypeSelect defaultValue={addReq.pathType} onSelect={(val) => updateAddReq("pathType", val)} />
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

      {/* 操作成功提示 */}
      {success && (
        <div className="text-sm font-bold">
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>操作成功</AlertTitle>
            <AlertDescription>若页面没有发生变化请重新查询后确认</AlertDescription>
          </Alert>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" className="text-sm" onClick={() => onClose(false)}>
          取消
        </Button>
        <Button className="text-sm" onClick={handleSubmit} disabled={submittIng}>
          {addReq.id && addReq.id > 0 ? (submittIng ? "更新中..." : "更新") : submittIng ? "保存中..." : "保存"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// 删除菜单
interface DeleteProps {
  item: Textbook; // 现有菜单值
  onClose: (val: boolean) => void; // 取消暂时什么都不做
  mutateCallback?: KeyedMutator<Textbook[]>; // 操作完毕后是否需要请求回调刷新缓存
}
function Delete({ item, onClose, mutateCallback }: DeleteProps) {
  const [submittIng, setSubmittIng] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");

  const handleSubmit = () => {
    setSubmittIng(true);
    setWarnInfo("");

    httpClient
      .get<boolean>(`/textbook/delete/${item.id}`)
      .then((res) => {
        mutateCallback?.();
        setSuccess(true);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="删除失败" message={err.message} />);
      })
      .finally(() => {
        setSubmittIng(false);
      });
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <Alert>
          <InfoIcon />
          <AlertTitle className="text-sm">删除操作</AlertTitle>
          <AlertDescription className="text-sm">
            你正在删除菜单 <span className="text-blue-600 font-bold">{item.label}</span>, 存在子菜单时不允许删除当前菜单,
            如需删除请从子菜单开始逐层往上删除
          </AlertDescription>
        </Alert>
      </div>

      <div>{warnInfo}</div>

      {/* 操作成功提示 */}
      {success && (
        <div className="text-sm font-bold">
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>删除成功</AlertTitle>
            <AlertDescription>若页面没有发生变化请重新查询后确认</AlertDescription>
          </Alert>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" className="text-sm" onClick={() => onClose(false)}>
          取消
        </Button>
        <Button className="text-sm" onClick={handleSubmit} disabled={submittIng}>
          {submittIng ? "删除中..." : "删除"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// 题目类型选择题
interface PathTypeProps {
  defaultValue?: string;
  onSelect: (val: string) => void;
}
function PathTypeSelect({ defaultValue, onSelect }: PathTypeProps) {
  const handleSelect = (val: string) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.textbookPathTypes.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? "default" : "outline"} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}
