import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { KeyedMutator } from "swr";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { YearSelect } from "~/common/paper/year";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import type {
  ClassInfoReq,
  ClassInfoResp,
  ClassListResp,
  ClassSearchReq,
  ClassStudentEditReq,
  ClassStudentReq,
  ClassStudentResp,
} from "~/type/class";
import { httpClient } from "~/util/http";
import { StringUtil, StringValidator } from "~/util/string";

// 班级编辑

// 班级新建默认值
const defaultAddReq: ClassInfoReq = {
  year: "",
  grade: "",
  semester: "",
  label: "",
  email: "",
  sortOrder: 0,
  remark: "",
};

interface ClassEditProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  searchReq: ClassSearchReq;
  infoResp: ClassInfoResp | null;
  classListMutate: KeyedMutator<ClassListResp>;
}

function ClassEdit({ open, setOpen, searchReq, infoResp, classListMutate }: ClassEditProps) {
  // 添加请求信息
  const [addReq, setAddReq] = useState<ClassInfoReq>(defaultAddReq);
  const updateAddReq = (key: keyof ClassInfoReq, value: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  // 初始化逻辑
  useEffect(() => {
    if (open) {
      // 用详情数据初始化
      if (infoResp && infoResp.id > 0) {
        setAddReq({ ...infoResp });
      } else {
        // 搜索条件作为默认值
        setAddReq({ ...defaultAddReq, ...searchReq });
      }
    }
  }, [open, infoResp, searchReq]);

  const [processIng, setProcessIng] = useState<boolean>(false);

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
        setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{addReq.id && addReq.id > 0 ? "编辑班级信息" : "添加班级信息"}</DialogTitle>
          <DialogDescription className="text-sm">个人邮箱用于接收班级学生账户密码</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm">选择年份:</label>
            </div>
            <YearSelect value={addReq.year} onValueChange={(val) => updateAddReq("year", val ?? "")} className="w-80" placeholder="选择年份" />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm">选择年级:</label>
            </div>
            <GradeSelect value={addReq.grade} onValueChange={(val) => updateAddReq("grade", val ?? "")} className="w-80" placeholder="选择年级" />
          </div>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm">选择学期:</label>
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
              <label className="text-sm leading-none">班级名称:</label>
            </div>
            <Input
              className="text-sm md:text-sm w-80"
              value={addReq.label}
              onChange={(e) => updateAddReq("label", e.target.value)}
              placeholder="例如 3班"
            />
          </div>

          {/* 邮箱 */}
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm leading-none">个人邮箱:</label>
            </div>
            <Input
              className="text-sm md:text-sm w-80"
              value={addReq.email}
              onChange={(e) => updateAddReq("email", e.target.value)}
              placeholder="例如 xx@xx.com 等"
            />
          </div>

          {/* 顺序 */}
          <div className="flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-sm leading-none">顺序:</label>
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
              <label className="text-sm leading-none">备注:</label>
            </div>
            <Textarea
              value={addReq.remark}
              className="texst-sm md:text-sm w-80"
              onChange={(e) => updateAddReq("remark", e.target.value)}
              placeholder={"请输入备注信息"}
            />
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => {
              setOpen(false);
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
  );
}

// 导入学生账户
interface UploadStudentAccountProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  infoResp: ClassInfoResp | null;
  classListMutate: KeyedMutator<ClassListResp>;
}

function UploadStudentAccount({ open, setOpen, infoResp, classListMutate }: UploadStudentAccountProps) {
  const [processIng, setProcessIng] = useState<boolean>(false);
  const [isIncrementalImport, setIsIncrementalImport] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<string>("");

  // 导入学生账户
  const handleSubmit = () => {
    // 做必要的检查
    if (!infoResp || infoResp.id <= 0) {
      toast.error(<div className="text-red-700">班级信息不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(infoResp.email)) {
      toast.error(<div className="text-red-700">没有配置个人邮箱, 无法接收账户登录密码等信息</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (accounts.length === 0) {
      toast.error(<div className="text-red-700">账户列表不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    // 解析学生账户
    const accountInfo = StringUtil.getStudentAccount(accounts);
    // 如果有重复则提示是否输入错误
    if (accountInfo.duplicates.length > 0) {
      toast.error(<div className="text-red-700">下列账户输入重复: {accountInfo.duplicates.join(", ")}, 请确认是否输入错误</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (accountInfo.commaSeparated.length === 0) {
      toast.error(<div className="text-red-700">账户列表有效账户为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    // 添加学生账户
    setProcessIng(true);

    let addReq: ClassStudentReq = {
      classId: infoResp.id,
      incremental: isIncrementalImport,
      accounts: accountInfo.commaSeparated,
    };

    httpClient
      .post<number>("/class/student/add", addReq)
      .then((res) => {
        setOpen(false);
        classListMutate();
        setAccounts(""); // 导入成功后清除上一次输入的账户内容
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">导入班级学生账户出错: {err.message}</div>, {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">导入班级学生账户</DialogTitle>
          <DialogDescription className="text-sm">不要输入学生的真实身份信息, 比如真实姓名, 学校班级名称等, 避免泄露真实身份</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
          <FieldGroup className="">
            <Field orientation="horizontal">
              <Checkbox
                id="terms-checkbox-desc"
                name="terms-checkbox-desc"
                checked={isIncrementalImport}
                onCheckedChange={(val) => setIsIncrementalImport(val)}
              />
              <FieldContent>
                <FieldLabel htmlFor="terms-checkbox-desc" className="text-sm">
                  是否增量导入
                </FieldLabel>
                <FieldDescription className="text-sm">
                  增量导入时不会覆盖已有学生账户, 也不允许当前导入的学生账户中有已存在的账户; 否则删除历史账户新增本次全部账户
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="student-list" className="text-sm">
                账户列表
              </FieldLabel>
              <FieldDescription className="text-sm">请输入班级学生账户列表, 一行一个账户; 中英文数字等不限制</FieldDescription>
              <Textarea
                id="student-list"
                value={accounts}
                rows={8}
                className="text-sm max-h-32 overflow-auto"
                onChange={(e) => {
                  setAccounts(e.target.value);
                }}
                placeholder={"请输入班级学生账户, 一行一个"}
              />
            </Field>
          </FieldGroup>
        </div>

        <Separator />

        <DialogFooter>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => {
              setOpen(false);
            }}
          >
            取消
          </Button>
          <Button className="text-sm" onClick={handleSubmit} disabled={processIng}>
            {processIng ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 班级学生账户详情列表
interface StudentAccountListProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  infoResp: ClassInfoResp | null;
}

const defaultStudentEditReq: ClassStudentEditReq = {
  id: 0,
  classId: 0,
  account: "",
  status: 0,
  remark: "",
};

function StudentAccountList({ open, setOpen, infoResp }: StudentAccountListProps) {
  // 维护学生账户列表
  const [studentList, setStudentList] = useState<ClassStudentResp[]>([]);

  // 用 Set 存储选中的学生 id
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 获取数据（使用 useEffect 避免重复请求）
  useEffect(() => {
    if (!open || !infoResp?.id) return;
    httpClient
      .get<ClassStudentResp[]>(`/class/student/${infoResp.id}/list`)
      .then((res) => {
        setStudentList(res);
        setSelectedIds(new Set());
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">查询班级学生账户出错: {err.message}</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
      });
  }, [open, infoResp?.id]);

  // 判断全选状态
  const totalCount = studentList.length;
  const selectedCount = selectedIds.size;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  // 全选/取消全选
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = studentList.map((s) => s.id);
      setSelectedIds(new Set(allIds));
    }
  };

  // 单选切换
  const toggleOne = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 批量操作示例
  const [editReq, setEditReq] = useState<ClassStudentEditReq>(defaultStudentEditReq);
  const updateEditReq = (key: keyof ClassStudentEditReq, value: number | string) => {
    setEditReq((prev) => ({ ...prev, [key]: value }));
  };

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [processIng, setProcessIng] = useState<boolean>(false);
  const handleSubmit = () => {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl sm:max-h-9sm:max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">班级学生账户列表</DialogTitle>
          <DialogDescription className="text-sm">如果需要重置密码或者暂停, 禁用账户, 请对应勾选需要处理的的账户</DialogDescription>
        </DialogHeader>

        <Separator />

        {selectedCount > 0 && <span className="ml-2 text-blue-600">（已选 {selectedCount} 项）</span>}

        <div className="space-y-4 py-2 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-sm font-semibold">
                  <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} aria-label="全选" />
                </TableHead>
                <TableHead className="text-sm font-semibold">账号</TableHead>
                <TableHead className="text-sm font-semibold">状态</TableHead>
                <TableHead className="text-sm font-semibold">备注</TableHead>
                <TableHead className="text-sm font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    暂无学生账户
                  </TableCell>
                </TableRow>
              ) : (
                studentList.map((student) => (
                  <TableRow key={student.id} className={selectedIds.has(student.id) ? "bg-muted/50" : ""}>
                    <TableCell className="text-sm">
                      <Checkbox checked={selectedIds.has(student.id)} onCheckedChange={() => toggleOne(student.id)} aria-label="选择行" />
                    </TableCell>
                    <TableCell className="text-sm">{student.account}</TableCell>
                    <TableCell className="text-sm">{student.statusDesc}</TableCell>
                    <TableCell className="text-sm">{student.remark || "-"}</TableCell>
                    <TableCell className="text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditReq({ ...student });
                          setEditDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => alert("没有实现")}
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

        {/* 编辑学生账户信息-内部对话框 */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="text-base font-semibold">编辑账户信息</DialogTitle>
              <DialogDescription className="text-sm">...</DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-4 py-2">
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm">账户名称:</label>
                </div>
                <Input
                  className="text-sm md:text-sm w-80"
                  value={editReq.account}
                  onChange={(e) => updateEditReq("account", e.target.value)}
                  placeholder="请输入新的账户名称"
                />
              </div>

              {/* 备注 */}
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm leading-none">备注:</label>
                </div>
                <Textarea
                  value={editReq.remark}
                  className="texst-sm md:text-sm w-80"
                  onChange={(e) => updateEditReq("remark", e.target.value)}
                  placeholder={"请输入备注信息"}
                />
              </div>
            </div>

            <Separator />

            <DialogFooter>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => {
                  setEditDialogOpen(false);
                }}
              >
                取消
              </Button>
              <Button className="text-sm" onClick={handleSubmit} disabled={processIng}>
                {processIng ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Separator />

        <DialogFooter>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => {
              setOpen(false);
              setSelectedIds(new Set());
            }}
          >
            取消
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ClassEdit, UploadStudentAccount, StudentAccountList };
