import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { SimplePagination } from '@/components/common/page';
import { SimpleTooltip } from '@/components/common/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import { useUserSessionList } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { useState } from 'react';
import type { Route } from './+types/session';

// 活跃用户 Session 列表

export function meta({}: Route.MetaArgs) {
  return [
    { title: '用户-活跃用户 Session 列表' },
    {
      name: 'description',
      content: '个人中心用户 Session 管理; 活跃用户 Session 列表',
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
  } = useUserSessionList(pageNo);

  const showLoading = useDelayedLoading(userListRespLoading);

  return (
    <div className="bg-card">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">活跃用户 Session 列表</CardTitle>
          <CardDescription>浏览活跃当前用户 Session 情况</CardDescription>
        </CardHeader>

        <CardContent>
          {/* 错误提示 */}
          {userListRespErr && <SimpleAlert title="用户 Session 列表获取失败" message={userListRespErr.message} />}

          {/* 加载中 */}
          {showLoading && <Loading />}

          {/* 表格 */}
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm font-semibold">ID</TableHead>
                  <TableHead className="text-sm font-semibold">userId</TableHead>
                  <TableHead className="text-sm font-semibold">来源</TableHead>
                  <TableHead className="text-sm font-semibold">账户名称</TableHead>
                  <TableHead className="text-sm font-semibold">渠道</TableHead>
                  <TableHead className="text-sm font-semibold">过期时间</TableHead>
                  <TableHead className="text-sm font-semibold">续期次数</TableHead>
                  <TableHead className="text-sm font-semibold">Client Ip</TableHead>
                  <TableHead className="text-sm font-semibold">User Agent</TableHead>
                  <TableHead className="text-sm font-semibold">创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userListResp.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  userListResp.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.userId}</TableCell>
                      <TableCell>{item.sourceDesc}</TableCell>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item.providerDesc}</TableCell>
                      <TableCell>{item.expiredAt}</TableCell>
                      <TableCell>{item.renewCnt}</TableCell>
                      <TableCell>{item.clientIp}</TableCell>
                      <TableCell>
                        <SimpleTooltip children={item.userAgent} />
                      </TableCell>
                      <TableCell>{item.createdAt}</TableCell>
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
    </div>
  );
}
