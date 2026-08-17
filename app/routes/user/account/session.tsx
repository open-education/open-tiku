import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { Route } from "./+types/session";
import { useState } from "react";
import { useUserSessionList } from "~/util/fetcher";
import { StringConst } from "~/util/string";
import { SimpleAlert } from "~/common/alert";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { SimplePagination } from "~/common/page";
import { SimpleTooltip } from "~/common/tooltip";

// 活跃用户 Session 列表

export function meta({}: Route.MetaArgs) {
  return [
    { title: "用户-活跃用户 Session 列表" },
    {
      name: "description",
      content: "个人中心用户 Session 管理; 活跃用户 Session 列表",
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

  return (
    <div className="p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base font-semibold">活跃用户 Session 列表</CardTitle>
          <CardDescription className="text-sm">浏览活跃当前用户 Session 情况</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 错误提示 */}
          {userListRespErr && <SimpleAlert title="用户 Session 列表获取失败" message={userListRespErr.message} />}

          {/* 加载中 */}
          {useDelayedLoading(userListRespLoading) && <Loading />}

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
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground text-sm">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  userListResp.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.id}</TableCell>
                      <TableCell className="text-sm">{item.userId}</TableCell>
                      <TableCell className="text-sm">{item.sourceDesc}</TableCell>
                      <TableCell className="text-sm">{item.username}</TableCell>
                      <TableCell className="text-sm">{item.providerDesc}</TableCell>
                      <TableCell className="text-sm">{item.expiredAt}</TableCell>
                      <TableCell className="text-sm">{item.renewCnt}</TableCell>
                      <TableCell className="text-sm">{item.clientIp}</TableCell>
                      <TableCell className="text-sm">
                        <SimpleTooltip children={item.userAgent} />
                      </TableCell>
                      <TableCell className="text-sm">{item.createdAt}</TableCell>
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
