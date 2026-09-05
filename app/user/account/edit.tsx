import { useState } from 'react';
import { toast } from 'sonner';
import type { KeyedMutator } from 'swr';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Separator } from '~/components/ui/separator';
import { Textarea } from '~/components/ui/textarea';
import type { UserIdentityInfoReq, UserIdentityInfoResp, UserIdentityListResp } from '~/type/user';
import { httpClient } from '~/util/http';
import { StringConst } from '~/util/string';

// 试卷状态选择器
interface AccountStatusSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function AccountStatusSelect({ defaultValue = 0, onSelect }: AccountStatusSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-start">
      {StringConst.accountStatusList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 编辑账户信息
interface AccountEditProps {
  open: boolean;
  setOpen: (val: boolean) => void;
  infoResp: UserIdentityInfoResp;
  accountListRespMutate: KeyedMutator<UserIdentityListResp>;
}

const defaultAccountEditReq: UserIdentityInfoReq = {
  id: 0,
  status: 0,
  remark: '',
};

function AccountEdit({ open, setOpen, infoResp, accountListRespMutate }: AccountEditProps) {
  // 批量操作示例
  const [editReq, setEditReq] = useState<UserIdentityInfoReq>({ ...infoResp });
  const updateEditReq = (key: keyof UserIdentityInfoReq, value: number | string) => {
    setEditReq((prev) => ({ ...prev, [key]: value }));
  };

  const [editProcessIng, setEditProcessIng] = useState<boolean>(false);

  const handleEdit = () => {
    if (editReq.id <= 0) {
      toast.error(<div className="text-red-700">没有选择账户</div>, {
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
      .post<boolean>('/user/account/edit', editReq)
      .then((res) => {
        setOpen(false);
        setEditReq({ ...defaultAccountEditReq });

        // 刷新账户列表, 重新查询列表页面
        accountListRespMutate();
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-300! max-w-[90vw]! flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">账户管理</DialogTitle>
          <DialogDescription className="text-sm">如果需要暂停或者封禁账户, 直接修改状态即可；暂停或封禁后, 该用户将无法登录平台</DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            {/* 状态 */}
            <span className="text-sm text-right">状态:</span>
            <AccountStatusSelect defaultValue={editReq.status} onSelect={(val) => updateEditReq('status', val)} />

            {/* 备注 */}
            <span className="text-sm text-right self-start pt-1.5">备注:</span>
            <Textarea
              className="text-sm md:text-sm"
              value={editReq.remark}
              onChange={(e) => updateEditReq('remark', e.target.value)}
              placeholder="请输入备注信息"
            />
          </div>
        </div>

        <Separator />

        <DialogFooter>
          {/* 按钮组 */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => {
                setOpen(false);
                setEditReq({ ...defaultAccountEditReq });
              }}
            >
              取消
            </Button>
            <Button className="text-sm" onClick={handleEdit} disabled={editProcessIng}>
              {editProcessIng ? '更新中...' : '更新'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AccountEdit };
