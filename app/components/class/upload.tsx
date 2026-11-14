import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import type { ClassInfoResp, ClassStudentReq } from '@/type/class';
import { getClassStudentListKey } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { StringValidator } from '@/util/string';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

// 导入学生账户
interface UploadStudentAccountProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  infoResp: ClassInfoResp | null;
}

export default function UploadStudentAccount({ open, setOpen, infoResp }: UploadStudentAccountProps) {
  const [processIng, setProcessIng] = useState<boolean>(false);
  // 默认增量导入
  const [isIncrementalImport, setIsIncrementalImport] = useState<boolean>(true);
  const [accounts, setAccounts] = useState<string>('');

  // 使用全局 mutate
  const { mutate } = useSWRConfig();

  // 导入学生账户
  const handleSubmit = async () => {
    // 做必要的检查
    if (!infoResp || infoResp.id <= 0) {
      toast.error(<div className="text-red-700">班级信息不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringValidator.isNonEmpty(infoResp.email)) {
      toast.error(<div className="text-red-700">没有配置个人邮箱, 无法接收账户登录密码等信息</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (accounts.length === 0) {
      toast.error(<div className="text-red-700">账户列表不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    // 解析学生账户
    const accountInfo = ObjectUtil.getStudentAccount(accounts);
    // 如果有重复则提示是否输入错误
    if (accountInfo.duplicates.length > 0) {
      toast.error(<div className="text-red-700">下列账户输入重复: {accountInfo.duplicates.join(', ')}, 请确认是否输入错误</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (accountInfo.commaSeparated.length === 0) {
      toast.error(<div className="text-red-700">账户列表有效账户为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    let notice = '确定全量导入学生账户? 班级内已有的学生账户会被全部清除';
    if (isIncrementalImport) {
      notice = '确定增量导入学生账户? 班级内已有的学生账户不会被清除';
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

    try {
      const res = await httpClient.post<number>('/class/student/add', addReq);
      setOpen(false);
      setAccounts(''); // 导入成功后清除上一次输入的账户内容

      // 添加了新账户, 需要刷新班级学生列表
      const key = getClassStudentListKey([infoResp.id]);
      await mutate(key);
    } catch (err) {
      const error = err as Error;
      toast.error(<div className="text-red-700">导入班级学生账户出错: {error.message}</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
    } finally {
      setProcessIng(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">导入班级学生账户</DialogTitle>
          <DialogDescription>不要输入学生的真实身份信息, 比如真实姓名, 学校班级名称等, 避免泄露真实身份</DialogDescription>
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
                <FieldDescription className="text-red-500">
                  增量导入时不会覆盖已有学生账户, 也不允许当前导入的学生账户中有已存在的账户; 否则删除历史账户新增本次全部账户
                </FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="student-list" className="text-sm">
                账户列表
              </FieldLabel>
              <FieldDescription>请输入班级学生账户列表, 一行一个账户; 中英文数字等不限制</FieldDescription>
              <Textarea
                id="student-list"
                value={accounts}
                rows={8}
                className="max-h-32 overflow-auto"
                onChange={(e) => {
                  setAccounts(e.target.value);
                }}
                placeholder={'请输入班级学生账户, 一行一个'}
              />
            </Field>
          </FieldGroup>
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
            {processIng ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
