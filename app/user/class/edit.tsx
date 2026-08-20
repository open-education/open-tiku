import { Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import type { KeyedMutator } from "swr";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { GradeSelect } from "~/common/paper/grade";
import { SemesterSelect } from "~/common/paper/semester";
import { YearSelect } from "~/common/paper/year";
import { SimpleTooltip } from "~/common/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type {
  ClassInfoReq,
  ClassInfoResp,
  ClassListResp,
  ClassSearchReq,
  ClassStudentEditReq,
  ClassStudentReq,
  ClassStudentResp,
} from "~/type/class";
import { useClassStudentList } from "~/util/fetcher";
import { httpClient } from "~/util/http";
import { StringConst, StringUtil, StringValidator } from "~/util/string";

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
      <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{addReq.id && addReq.id > 0 ? "编辑班级信息" : "添加班级信息"}</DialogTitle>
          <DialogDescription className="text-sm">个人邮箱用于接收班级学生账户密码</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="py-4">
          {/* Grid 布局：左列固定 100px 右对齐，右列自适应 */}
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            {/* 年份 */}
            <span className="text-sm text-right">选择年份:</span>
            <YearSelect value={addReq.year} onValueChange={(val) => updateAddReq("year", val ?? "")} placeholder="选择年份" />

            {/* 年级 */}
            <span className="text-sm text-right">选择年级:</span>
            <GradeSelect value={addReq.grade} onValueChange={(val) => updateAddReq("grade", val ?? "")} placeholder="选择年级" />

            {/* 学期 */}
            <span className="text-sm text-right">选择学期:</span>
            <SemesterSelect value={addReq.semester} onValueChange={(val) => updateAddReq("semester", val ?? "")} placeholder="选择学期" />

            {/* 班级名称 */}
            <span className="text-sm text-right">班级名称:</span>
            <Input className="text-sm" value={addReq.label} onChange={(e) => updateAddReq("label", e.target.value)} placeholder="例如 3班" />

            {/* 个人邮箱 */}
            <span className="text-sm text-right">个人邮箱:</span>
            <Input className="text-sm" value={addReq.email} onChange={(e) => updateAddReq("email", e.target.value)} placeholder="例如 xx@xx.com" />

            {/* 顺序 */}
            <span className="text-sm text-right">顺序:</span>
            <Input
              className="text-sm"
              type="number"
              min="0"
              value={addReq.sortOrder}
              onChange={(e) => updateAddReq("sortOrder", Number(e.target.value))}
            />

            {/* 备注 - 让标签和文本域顶部对齐 */}
            <span className="text-sm text-right self-start pt-1.5">备注:</span>
            <Textarea
              className="text-sm min-h-19 resize-y"
              value={addReq.remark}
              onChange={(e) => updateAddReq("remark", e.target.value)}
              placeholder="请输入备注信息"
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
}

function UploadStudentAccount({ open, setOpen, infoResp }: UploadStudentAccountProps) {
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
    let notice = "确定全量导入学生账户? 班级内已有的学生账户会被全部清除";
    if (isIncrementalImport) {
      notice = "确定增量导入学生账户? 班级内已有的学生账户不会被清除";
    }
    // 最后做提示导入行为
    if (!confirm(notice)) {
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
      <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">导入班级学生账户</DialogTitle>
          <DialogDescription className="text-sm">不要输入学生的真实身份信息, 比如真实姓名, 学校班级名称等, 避免泄露真实身份</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 p-4">
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
                <FieldDescription className="text-sm text-red-500">
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

function StudentAccountList({ open, setOpen, infoResp }: StudentAccountListProps) {
  // 用 Set 存储选中的学生 id
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 每次弹窗打开时，版本号 +1
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (open) {
      setVersion((prev) => prev + 1);
    }
  }, [open]);

  const {
    data: studentListResp = [],
    isLoading: studentListRespIdLoading,
    error: studentListRespErr,
    mutate: studentListRespMutate,
  } = useClassStudentList(infoResp?.id || 0, version);

  // 判断全选状态
  const totalCount = studentListResp.length;
  const selectedCount = selectedIds.size;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  // 全选/取消全选
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      const allIds = studentListResp.map((s) => s.id);
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

  // 编辑账户
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editInfoResp, setEditInfoResp] = useState<ClassStudentResp | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-300! max-w-[90vw]! flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">班级学生账户列表</DialogTitle>
          <DialogDescription className="text-sm">如果需要重置密码或者暂停, 禁用账户, 请对应勾选需要处理的的账户</DialogDescription>
        </DialogHeader>

        <Separator />

        {studentListRespErr && <SimpleAlert title="班级学生账户列表获取出错" message={studentListRespErr.message} />}

        {useDelayedLoading(studentListRespIdLoading) && <Loading />}

        <div className="space-y-4 py-2 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-sm font-semibold">
                  <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} aria-label="全选" />
                </TableHead>
                <TableHead className="text-sm font-semibold">账号</TableHead>
                <TableHead className="text-sm font-semibold">状态</TableHead>
                <TableHead className="text-sm font-semibold">最后登录时间</TableHead>
                <TableHead className="text-sm font-semibold">登录次数</TableHead>
                <TableHead className="text-sm font-semibold">备注</TableHead>
                <TableHead className="text-sm font-semibold">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentListResp.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm">
                    暂无学生账户
                  </TableCell>
                </TableRow>
              ) : (
                studentListResp.map((student) => (
                  <TableRow key={student.id} className={selectedIds.has(student.id) ? "bg-muted/50" : ""}>
                    <TableCell className="text-sm">
                      <Checkbox checked={selectedIds.has(student.id)} onCheckedChange={() => toggleOne(student.id)} aria-label="选择行" />
                    </TableCell>
                    <TableCell className="text-sm">{student.account}</TableCell>
                    <TableCell className="text-sm">{student.statusDesc}</TableCell>
                    <TableCell className="text-sm">{student.lastLoginTime}</TableCell>
                    <TableCell className="text-sm">{student.loginCount}</TableCell>
                    <TableCell className="text-sm">
                      <SimpleTooltip children={student.remark || "-"} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditInfoResp(student);
                          setEditDialogOpen(true);
                        }}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => alert("删除暂未实现")}
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
        {editDialogOpen &&
          editInfoResp &&
          editInfoResp.id > 0 &&
          createPortal(
            <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setEditDialogOpen(false)}>
              <div className="bg-white w-[40vw] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                  <div className="text-base font-semibold text-gray-800">账户修改</div>
                  <button className="text-gray-400 hover:text-gray-600 focus:outline-none" onClick={() => setEditDialogOpen(false)} aria-label="关闭">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* 内容区域 */}
                <StudentAccountEdit setOpen={setEditDialogOpen} infoResp={editInfoResp} studentListRespMutate={studentListRespMutate} />
              </div>
            </div>,
            document.body,
          )}

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

          <Button
            variant="outline"
            className="text-sm"
            onClick={() => {
              alert("批量操作后续支持");
            }}
          >
            批量删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// 试卷状态选择器
interface StudentStatusSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function StudentStatusSelect({ defaultValue = 0, onSelect }: StudentStatusSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {StringConst.studentStatusList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? "default" : "outline"} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 编辑学生账户信息
interface StudentAccountEditProps {
  setOpen: (val: boolean) => void;
  infoResp: ClassStudentResp;
  studentListRespMutate: KeyedMutator<ClassStudentResp[]>;
}

const defaultStudentEditReq: ClassStudentEditReq = {
  id: 0,
  classId: 0,
  account: "",
  resetPwd: false,
  status: 0,
  remark: "",
};

function StudentAccountEdit({ setOpen, infoResp, studentListRespMutate }: StudentAccountEditProps) {
  // 批量操作示例
  const [editReq, setEditReq] = useState<ClassStudentEditReq>({ ...infoResp, resetPwd: false });
  const updateEditReq = (key: keyof ClassStudentEditReq, value: number | string | boolean) => {
    setEditReq((prev) => ({ ...prev, [key]: value }));
  };

  const [editProcessIng, setEditProcessIng] = useState<boolean>(false);

  const handleEdit = () => {
    if (editReq.id <= 0) {
      toast.error(<div className="text-red-700">没有选择学生账户</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(editReq.account)) {
      toast.error(<div className="text-red-700">账户为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    setEditProcessIng(true);

    // 请求编辑账户更新
    httpClient
      .post<boolean>("/class/student/edit", editReq)
      .then((res) => {
        setOpen(false);
        setEditReq({ ...defaultStudentEditReq });

        // 刷新账户列表, 重新查询列表页面
        studentListRespMutate();
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">编辑账户信息出错: {err.message}</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
      })
      .finally(() => {
        setEditProcessIng(false);
      });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4 py-4 px-8">
      <div className="text-sm text-gray-500">若重置密码, 更新成功后会将新的密码发送到你的个人邮箱中</div>

      {/* 账户名称 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">账户名称:</label>
        <Input
          className="flex-1 text-sm md:text-sm"
          value={editReq.account}
          onChange={(e) => updateEditReq("account", e.target.value)}
          placeholder="请输入新的账户名称"
        />
      </div>

      {/* 状态 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">状态:</label>
        <StudentStatusSelect defaultValue={editReq.status} onSelect={(val) => updateEditReq("status", val)} />
      </div>

      {/* 重置密码 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">重置密码:</label>
        <div className="flex-1 flex items-center justify-between">
          <Switch checked={editReq.resetPwd} onCheckedChange={(val) => updateEditReq("resetPwd", val)} />
        </div>
      </div>

      {/* 备注 */}
      <div className="flex items-start gap-4">
        <label className="text-sm w-20 shrink-0 pt-1">备注:</label>
        <Textarea
          className="flex-1 text-sm md:text-sm"
          value={editReq.remark}
          onChange={(e) => updateEditReq("remark", e.target.value)}
          placeholder="请输入备注信息"
        />
      </div>

      <Separator />

      {/* 按钮组 */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => {
            setOpen(false);
            setEditReq({ ...defaultStudentEditReq });
          }}
        >
          取消
        </Button>
        <Button className="text-sm" onClick={handleEdit} disabled={editProcessIng}>
          {editProcessIng ? "更新中..." : "更新"}
        </Button>
      </div>
    </div>
  );
}

export { ClassEdit, UploadStudentAccount, StudentAccountList };
