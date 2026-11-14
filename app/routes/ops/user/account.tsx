import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { SimplePagination } from '@/components/common/page';
import { SimpleTooltip } from '@/components/common/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AccountEdit } from '@/components/user/account';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { UserIdentityInfoResp } from '@/type/user';
import { useUserAccountList } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import type { Route } from './+types/account';

// 网站第三方登录用户列表

export function meta({}: Route.MetaArgs) {
  return [
    { title: '用户-第三方账户列表' },
    {
      name: 'description',
      content: '个人中心用户账户管理; 第三方登录账户列表',
    },
  ];
}

export default function Index() {
  const [pageNo, setPageNo] = useState<number>(1);

  const {
    data: userListResp = {
      list: [],
      pageNo,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading: userListRespLoading,
    error: userListRespErr,
    mutate: accountListRespMutate,
  } = useUserAccountList(pageNo);

  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [editInfoResp, setEditInfoResp] = useState<UserIdentityInfoResp | null>(null);

  return (
    <div className="bg-card">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">第三方登录账户管理</CardTitle>
          <CardDescription>第三方登录账户只允许修改用户状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div>1. 如果需要下线用户, 修改用户状态为 暂停/封禁 即可, 更新后用户将下线, 账户状态再恢复为 激活 前将无法再登录平台</div>
          </div>

          {/* 错误提示 */}
          {userListRespErr && <SimpleAlert title="用户列表获取失败" message={userListRespErr.message} />}

          {/* 加载中 */}
          {useDelayedLoading(userListRespLoading) && <Loading />}

          {/* 表格 */}
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">ID</TableHead>
                  <TableHead className="text-sm">userId</TableHead>
                  <TableHead className="text-sm">来源</TableHead>
                  <TableHead className="text-sm">账户名称</TableHead>
                  <TableHead className="text-sm">最后登录时间</TableHead>
                  <TableHead className="text-sm">登录次数</TableHead>
                  <TableHead className="text-sm">角色</TableHead>
                  <TableHead className="text-sm">状态</TableHead>
                  <TableHead className="text-sm">创建时间</TableHead>
                  <TableHead className="text-sm">备注</TableHead>
                  <TableHead className="text-sm">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userListResp.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  userListResp.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.userId}</TableCell>
                      <TableCell>{item.providerDesc}</TableCell>
                      <TableCell>{item.providerUsername}</TableCell>
                      <TableCell>{item.lastLoginTime}</TableCell>
                      <TableCell>{item.loginCount}</TableCell>
                      <TableCell>{item.roleDesc}</TableCell>
                      <TableCell>{item.statusDesc}</TableCell>
                      <TableCell>{item.createdAt}</TableCell>
                      <TableCell>
                        <SimpleTooltip children={item.remark} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditDialogOpen(true);
                            setEditInfoResp(item);
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页信息 */}
          {userListResp.total > 0 && (
            <div className="mt-3">
              <SimplePagination
                pageNo={userListResp.pageNo}
                pageSize={userListResp.pageSize}
                total={userListResp.total}
                onPageChange={(pageNo) => {
                  setPageNo(pageNo);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑窗口 */}
      {editDialogOpen && editInfoResp && (
        <AccountEdit open={editDialogOpen} setOpen={setEditDialogOpen} infoResp={editInfoResp} accountListRespMutate={accountListRespMutate} />
      )}
    </div>
  );
}
