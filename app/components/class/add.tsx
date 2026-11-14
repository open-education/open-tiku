import { GradeSelect } from '@/components/class/grade';
import { SemesterSelect } from '@/components/class/semester';
import { YearSelect } from '@/components/class/year';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { ClassInfoReq, ClassInfoResp, ClassListResp, ClassSearchReq } from '@/type/class';
import { httpClient } from '@/util/http';
import { StringValidator } from '@/util/string';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';

// 班级新建默认值
const defaultAddReq: ClassInfoReq = {
  year: '',
  grade: '',
  semester: '',
  label: '',
  email: '',
  sortOrder: 0,
  remark: '',
};

interface ClassAddProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  searchReq: ClassSearchReq;
  infoResp: ClassInfoResp | null;
  classListMutate: KeyedMutator<ClassListResp>;
}

export default function ClassAdd({ open, setOpen, searchReq, infoResp, classListMutate }: ClassAddProps) {
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
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(addReq.label)) {
      toast.error(<div className="text-red-700">班级名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.sortOrder <= 0) {
      toast.error(<div className="text-red-700">排序顺序不能小于等于0</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setProcessIng(true);

    httpClient
      .post('/class/add', addReq)
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
            label: '关闭',
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
          <DialogTitle className="text-base font-semibold">{addReq.id && addReq.id > 0 ? '编辑班级信息' : '添加班级信息'}</DialogTitle>
          <DialogDescription className="text-sm">个人邮箱用于接收班级学生账户密码</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="py-4">
          {/* Grid 布局：左列固定 100px 右对齐，右列自适应 */}
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            {/* 年份 */}
            <span className="text-sm text-right">选择年份:</span>
            <YearSelect value={addReq.year} onValueChange={(val) => updateAddReq('year', val ?? '')} placeholder="选择年份" />

            {/* 年级 */}
            <span className="text-sm text-right">选择年级:</span>
            <GradeSelect value={addReq.grade} onValueChange={(val) => updateAddReq('grade', val ?? '')} placeholder="选择年级" />

            {/* 学期 */}
            <span className="text-sm text-right">选择学期:</span>
            <SemesterSelect value={addReq.semester} onValueChange={(val) => updateAddReq('semester', val ?? '')} placeholder="选择学期" />

            {/* 班级名称 */}
            <span className="text-sm text-right">班级名称:</span>
            <Input value={addReq.label} onChange={(e) => updateAddReq('label', e.target.value)} placeholder="例如 3班" />

            {/* 个人邮箱 */}
            <span className="text-sm text-right">个人邮箱:</span>
            <Input value={addReq.email} onChange={(e) => updateAddReq('email', e.target.value)} placeholder="例如 xx@xx.com" />

            {/* 顺序 */}
            <span className="text-sm text-right">顺序:</span>
            <Input type="number" min="0" value={addReq.sortOrder} onChange={(e) => updateAddReq('sortOrder', Number(e.target.value))} />

            {/* 备注 - 让标签和文本域顶部对齐 */}
            <span className="text-sm text-right self-start pt-1.5">备注:</span>
            <Textarea
              className="min-h-19 resize-y"
              value={addReq.remark}
              onChange={(e) => updateAddReq('remark', e.target.value)}
              placeholder="请输入备注信息"
            />
          </div>
        </div>

        <Separator />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
            }}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={processIng}>
            {addReq.id && addReq.id > 0 ? (processIng ? '更新中...' : '更新') : processIng ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
