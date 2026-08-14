import type { ClassInfoReq, ClassInfoResp, ClassSearchReq } from "~/type/class";
import type { Route } from "./+types/index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { YearSelect } from "~/common/paper/year";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { SimplePagination } from "~/common/page";
import { useClassList } from "~/util/fetcher";
import { StringConst, StringValidator } from "~/util/string";
import { httpClient } from "~/util/http";
import { toast } from "sonner";
import { Textarea } from "~/components/ui/textarea";

// 我的班级

export function meta({}: Route.MetaArgs) {
  return [
    { title: "班级-我的班级" },
    {
      name: "description",
      content: "个人中心我的班级管理; 导入班级学生账号, 生成学生账户登录密码",
    },
  ];
}

// 班级新建默认值
const defaultAddReq: ClassInfoReq = {
  year: "",
  grade: "",
  semester: "",
  label: "",
  sortOrder: 0,
  remark: "",
};

// 搜索默认值
const defaultSearchReq: ClassSearchReq = {
  year: "",
  grade: "",
  semester: "",
};

export default function Index() {
  // 存储搜索信息
  const [searchReq, setSearchReq] = useState<ClassSearchReq>(defaultSearchReq);
  const updateSearchReq = (key: keyof ClassSearchReq, value: string) => {
    setSearchReq((prev) => ({ ...prev, [key]: value }));
  };

  // 添加请求信息
  const [addReq, setAddReq] = useState<ClassInfoReq>(defaultAddReq);
  const updateAddReq = (key: keyof ClassInfoReq, value: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 班级列表
  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: classListResp = {
      list: [],
      pageNo: 1,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading: classListLoading,
    error: classListErr,
    mutate: classListMutate,
  } = useClassList(searchReq, pageNo);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [processIng, setProcessIng] = useState<boolean>(false);

  // 班级添加
  const handleAdd = () => {
    // 用搜索的条件作为默认值
    setAddReq({ ...defaultAddReq, ...searchReq });
    setDialogOpen(true);
  };

  // 编辑班级
  const handleEdit = (info: ClassInfoResp) => {
    setAddReq({ ...info });
    setDialogOpen(true);
  };

  // 保存班级信息
  const handleSubmit = () => {
    if (!StringValidator.isNonEmpty(addReq.year)) {
      toast.error(<div className="text-red-700">年份不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.label)) {
      toast.error(<div className="text-red-700">班级名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.sortOrder <= 0) {
      toast.error(<div className="text-red-700">排序顺序不能小于等于0</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setProcessIng(true);

    httpClient
      .post("/class/add", addReq)
      .then((res) => {
        // 添加成功则清除表单其它项
        setAddReq({ ...addReq, ...searchReq });
        setDialogOpen(false);
        // 同时要重新刷新班级列表
        classListMutate();
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
      .finally(() => {
        setProcessIng(false);
      });
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
    <div className="p-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">我的班级管理</CardTitle>
          <Button className="text-sm" onClick={handleAdd} variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            新增
          </Button>
        </CardHeader>
        <CardContent>
          {/* 搜索选项 */}
          <div className="text-base mt-3">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">年份:</div>
                <div className="flex-1 min-w-0">
                  <YearSelect value={searchReq.year} onValueChange={(val) => updateSearchReq("year", val ?? "")} placeholder="选择年份" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">年级:</div>
                <div className="flex-1 min-w-0">
                  <GradeSelect value={searchReq.grade} onValueChange={(val) => updateSearchReq("grade", val ?? "")} placeholder="选择年级" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                <div className="md:w-24 shrink-0 font-medium">学期:</div>
                <div className="flex-1 min-w-0">
                  <SemesterSelect value={searchReq.semester} onValueChange={(val) => updateSearchReq("semester", val ?? "")} placeholder="选择学期" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <Separator />
          </div>

          {/* 错误提示 */}
          {classListErr && <SimpleAlert title="班级列表获取失败" message={classListErr.message} />}

          {/* 加载中 */}
          {useDelayedLoading(classListLoading) && <Loading />}

          {/* 表格 */}
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">ID</TableHead>
                  <TableHead className="text-sm">年份</TableHead>
                  <TableHead className="text-sm">年级</TableHead>
                  <TableHead className="text-sm">学期</TableHead>
                  <TableHead className="text-sm">名称</TableHead>
                  <TableHead className="text-sm">排序</TableHead>
                  <TableHead className="text-sm">备注</TableHead>
                  <TableHead className="text-sm">创建时间</TableHead>
                  <TableHead className="text-sm">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <ClassListShow list={classListResp.list} onEdit={(val) => handleEdit(val)} onDelete={(id) => handleDelete(id)} />
              </TableBody>
            </Table>
          </div>

          {/* 分页信息 */}
          {classListResp.total > 0 && (
            <div className="mt-3">
              <SimplePagination
                pageNo={classListResp.pageNo}
                pageSize={classListResp.pageSize}
                total={classListResp.total}
                onPageChange={(pageNo) => {
                  setPageNo(pageNo);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">{addReq.id && addReq.id > 0 ? "编辑班级" : "添加班级"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm">选择年份</label>
              </div>
              <YearSelect value={addReq.year} onValueChange={(val) => updateAddReq("year", val ?? "")} className="w-80" placeholder="选择年份" />
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm">选择年级</label>
              </div>
              <GradeSelect value={addReq.grade} onValueChange={(val) => updateAddReq("grade", val ?? "")} className="w-80" placeholder="选择年级" />
            </div>

            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm">选择学期</label>
              </div>
              <SemesterSelect
                value={addReq.semester}
                onValueChange={(val) => updateAddReq("semester", val ?? "")}
                className="w-80"
                placeholder="选择学期"
              />
            </div>

            {/* 名称 */}
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm leading-none">班级名称</label>
              </div>
              <Input
                className="text-sm md:text-sm w-80"
                value={addReq.label}
                onChange={(e) => updateAddReq("label", e.target.value)}
                placeholder="例如 3班"
              />
            </div>

            {/* 顺序 */}
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm leading-none">顺序</label>
              </div>
              <Input
                className="text-sm md:text-sm w-80"
                type="number"
                min="0"
                value={addReq.sortOrder}
                onChange={(e) => updateAddReq("sortOrder", Number(e.target.value))}
              />
            </div>

            {/* 备注 */}
            <div className="flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm leading-none">备注</label>
              </div>
              <Textarea
                value={addReq.remark}
                className="texst-sm md:text-sm w-80"
                onChange={(e) => updateAddReq("remark", e.target.value)}
                placeholder={"请输入备注信息"}
              />
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
              {addReq.id && addReq.id > 0 ? (processIng ? "更新中..." : "更新") : processIng ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 展示班级列表
interface ClassListShowProps {
  list: ClassInfoResp[];
  onEdit: (val: ClassInfoResp) => void;
  onDelete: (val: number) => void;
}
function ClassListShow({ list, onEdit, onDelete }: ClassListShowProps) {
  return (
    <>
      {list.length === 0 ? (
        <TableRow>
          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
            暂无数据，点击 新增 添加
          </TableCell>
        </TableRow>
      ) : (
        list.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="text-sm">{item.id}</TableCell>
            <TableCell className="text-sm">{item.year}</TableCell>
            <TableCell className="text-sm">{item.grade}</TableCell>
            <TableCell className="text-sm">{item.semester}</TableCell>
            <TableCell className="text-sm">{item.label}</TableCell>
            <TableCell className="text-sm">{item.sortOrder}</TableCell>
            <TableCell className="text-sm">{item.remark}</TableCell>
            <TableCell className="text-sm">{item.createdAt}</TableCell>
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
