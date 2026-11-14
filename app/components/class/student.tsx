import { StatusSelect } from '@/components/class/status';
import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { SimpleTooltip } from '@/components/common/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { ClassInfoResp, ClassStudentEditReq, ClassStudentResp } from '@/type/class';
import { useClassStudentList } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { StringValidator } from '@/util/string';
import { Pencil, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';

// 班级学生账户详情列表
interface StudentAccountListProps {
  infoResp: ClassInfoResp | null;
}

function StudentList({ infoResp }: StudentAccountListProps) {
  // 用 Set 存储选中的学生 id
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const {
    data: classStudentMapResp = {},
    isLoading: classStudentMapRespIdLoading,
    error: classStudentMapRespErr,
    mutate: classStudentMapRespMutate,
  } = useClassStudentList([infoResp?.id || 0]);
  const studentListResp = useMemo(() => {
    if (infoResp && infoResp.id > 0) {
      return classStudentMapResp[infoResp.id] || [];
    }
    return [];
  }, [classStudentMapResp]);

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
  const [editStudent, setEditStudent] = useState<ClassStudentResp | null>(null);

  const showLoading = useDelayedLoading(classStudentMapRespIdLoading);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 border-border/40 bg-secondary">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">班级学生信息列表</CardTitle>
        <CardDescription>班级学生信息列表</CardDescription>
      </CardHeader>

      <Separator />

      <CardContent>
        {classStudentMapRespErr && <SimpleAlert title="班级学生账户列表获取出错" message={classStudentMapRespErr.message} />}

        {showLoading && <Loading />}

        <div className="space-y-4 py-2 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-sm">
                  <Checkbox checked={isAllSelected} onCheckedChange={toggleAll} aria-label="全选" />
                </TableHead>
                <TableHead className="text-sm">账号</TableHead>
                <TableHead className="text-sm">状态</TableHead>
                <TableHead className="text-sm">最后登录时间</TableHead>
                <TableHead className="text-sm">登录次数</TableHead>
                <TableHead className="text-sm">备注</TableHead>
                <TableHead className="text-sm">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentListResp.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    暂无学生账户
                  </TableCell>
                </TableRow>
              ) : (
                studentListResp.map((student) => (
                  <TableRow key={student.id} className={selectedIds.has(student.id) ? 'bg-muted/50' : ''}>
                    <TableCell>
                      <Checkbox checked={selectedIds.has(student.id)} onCheckedChange={() => toggleOne(student.id)} aria-label="选择行" />
                    </TableCell>
                    <TableCell>{student.account}</TableCell>
                    <TableCell>{student.statusDesc}</TableCell>
                    <TableCell>{student.lastLoginTime}</TableCell>
                    <TableCell>{student.loginCount}</TableCell>
                    <TableCell>
                      <SimpleTooltip children={student.remark || '-'} />
                    </TableCell>
                    <TableCell className="text-sm">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditDialogOpen(true);
                          setEditStudent(student);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => alert('删除暂未实现')}
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

          {/* 编辑学生 */}
          <Dialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setEditDialogOpen(false);
                setEditStudent(null);
              }
            }}
          >
            <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold">编辑学生信息</DialogTitle>
                <DialogDescription>重置密码，删除或者停用非必要的账户</DialogDescription>
              </DialogHeader>

              <Separator />

              {editDialogOpen && editStudent && (
                <StudentEdit
                  key={editStudent.id}
                  infoResp={editStudent}
                  setOpen={setEditDialogOpen}
                  classStudentMapRespMutate={classStudentMapRespMutate}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          size="sm"
          onClick={() => {
            alert('暂未实现');
          }}
        >
          批量删除
        </Button>
      </CardFooter>
    </Card>
  );
}

// 编辑学生账户信息
interface StudentEditProps {
  infoResp: ClassStudentResp;
  setOpen: (val: boolean) => void;
  classStudentMapRespMutate: KeyedMutator<Record<number, ClassStudentResp[]>>;
}

const defaultStudentEditReq: ClassStudentEditReq = {
  id: 0,
  classId: 0,
  account: '',
  resetPwd: false,
  status: 0,
  remark: '',
};

function StudentEdit({ infoResp, setOpen, classStudentMapRespMutate }: StudentEditProps) {
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
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(editReq.account)) {
      toast.error(<div className="text-red-700">账户为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setEditProcessIng(true);

    // 请求编辑账户更新
    httpClient
      .post<boolean>('/class/student/edit', editReq)
      .then((res) => {
        setEditReq({ ...defaultStudentEditReq });

        // 刷新账户列表, 重新查询列表页面
        classStudentMapRespMutate();

        setOpen(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">编辑账户信息出错: {err.message}</div>, {
          duration: Infinity,
          action: {
            label: '关闭',
            onClick: () => {},
          },
        });
      })
      .finally(() => {
        setEditProcessIng(false);
      });
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      <div className="text-xs text-gray-500">若重置密码, 更新成功后会将新的密码发送到你的个人邮箱中</div>

      {/* 账户名称 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">账户名称:</label>
        <Input value={editReq.account} onChange={(e) => updateEditReq('account', e.target.value)} placeholder="请输入新的账户名称" />
      </div>

      {/* 状态 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">状态:</label>
        <StatusSelect defaultValue={editReq.status} onSelect={(val) => updateEditReq('status', val)} />
      </div>

      {/* 重置密码 */}
      <div className="flex items-center gap-4">
        <label className="text-sm w-20 shrink-0">重置密码:</label>
        <div className="flex-1 flex items-center justify-between">
          <Switch checked={editReq.resetPwd} onCheckedChange={(val) => updateEditReq('resetPwd', val)} />
        </div>
      </div>

      {/* 备注 */}
      <div className="flex items-start gap-4">
        <label className="text-sm w-20 shrink-0 pt-1">备注:</label>
        <Textarea value={editReq.remark} onChange={(e) => updateEditReq('remark', e.target.value)} placeholder="请输入备注信息" />
      </div>

      <Separator />

      {/* 按钮组 */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => {
            setOpen(false);
            setEditReq({ ...defaultStudentEditReq });
          }}
        >
          取消
        </Button>
        <Button onClick={handleEdit} disabled={editProcessIng}>
          {editProcessIng ? '更新中...' : '更新'}
        </Button>
      </div>
    </div>
  );
}

export { StudentEdit, StudentList };
