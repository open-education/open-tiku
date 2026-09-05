import type { ClassInfoResp, ClassSearchReq } from '~/type/class';
import type { Route } from './+types/index';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { useState } from 'react';
import { SimpleAlert } from '~/common/alert';
import { Loading } from '~/common/load';
import { SimplePagination } from '~/common/page';
import { useClassList } from '~/util/fetcher';
import { StringConst } from '~/util/string';
import { ClassEdit, StudentAccountList, UploadStudentAccount } from '~/user/class/edit';
import { SimpleTooltip } from '~/common/tooltip';
import { SearchConfig } from '~/user/class/config';

// 我的班级

export function meta({}: Route.MetaArgs) {
  return [
    { title: '班级-我的班级' },
    {
      name: 'description',
      content: '个人中心我的班级管理; 导入班级学生账号, 生成学生账户登录密码',
    },
  ];
}

// 搜索默认值
const defaultSearchReq: ClassSearchReq = {
  year: '',
  grade: '',
  semester: '',
};

export default function Index() {
  // 存储搜索信息
  const [searchReq, setSearchReq] = useState<ClassSearchReq>(defaultSearchReq);
  const updateSearchReq = (key: keyof ClassSearchReq, value: string) => {
    setSearchReq((prev) => ({ ...prev, [key]: value }));
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

  // 班级信息编辑对话框
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // 临时记录传递的详情信息
  const [infoResp, setInfoResp] = useState<ClassInfoResp | null>(null);

  // 导入学生账户对话框
  const [uploadStudentDialogOpen, setUploadStudentAccountOpen] = useState<boolean>(false);

  // 查看详情对话框
  const [viewInfoDialogOpen, setViewInfoDialogOpen] = useState<boolean>(false);

  return (
    <div className="p-4 bg-muted">
      <Card className="w-full">
        <CardHeader className="flex flex-row justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">我的班级管理</CardTitle>
          <Button
            className="text-sm"
            onClick={() => {
              setInfoResp(null);
              setEditDialogOpen(true);
            }}
            variant="secondary"
          >
            <Plus className="mr-2 h-4 w-4" />
            新增
          </Button>
        </CardHeader>
        <CardContent>
          {/* 说明事项 */}
          <div className="text-sm">
            <div>
              1. 目前发送学生账户密码的邮件抬头是:&nbsp;
              <span className="text-blue-600 text-base font-semibold">
                {StringConst.defaultServEmailTitle}
                &nbsp;&lt;{StringConst.defaultServEmail}&gt;
              </span>
              , 有每日容量限制, 如果接收不到邮件或者垃圾箱也没有收到邮件, 先不要操作, 在客服群反应等确认原因后再上传学生账户;
            </div>
            <div>2. 生成密码本身比较耗时, 一次添加的用户建议不要超过 20 个;</div>
            <div>3. 上传学生账户时, 注意是覆盖上传还是增量上传, 覆盖上传会清空班级内已有的学生账户;</div>
          </div>

          <div className="my-4">
            <Separator />
          </div>

          {/* 搜索选项 */}
          <div className="text-base mt-3">
            <SearchConfig searchReq={searchReq} updateSearchReq={updateSearchReq} />
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
                  <TableHead className="text-sm font-semibold">ID</TableHead>
                  <TableHead className="text-sm font-semibold">年份</TableHead>
                  <TableHead className="text-sm font-semibold">年级</TableHead>
                  <TableHead className="text-sm font-semibold">学期</TableHead>
                  <TableHead className="text-sm font-semibold">名称</TableHead>
                  <TableHead className="text-sm font-semibold">邮箱</TableHead>
                  <TableHead className="text-sm font-semibold">排序</TableHead>
                  <TableHead className="text-sm font-semibold">备注</TableHead>
                  <TableHead className="text-sm font-semibold">创建时间</TableHead>
                  <TableHead className="text-sm font-semibold">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classListResp.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground text-sm">
                      暂无数据，点击 新增 添加
                    </TableCell>
                  </TableRow>
                ) : (
                  classListResp.list.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-sm">{item.id}</TableCell>
                      <TableCell className="text-sm">{item.year}</TableCell>
                      <TableCell className="text-sm">{item.grade}</TableCell>
                      <TableCell className="text-sm">{item.semester}</TableCell>
                      <TableCell className="text-sm">{item.label}</TableCell>
                      <TableCell className="text-sm">
                        <SimpleTooltip children={item.email} />
                      </TableCell>
                      <TableCell className="text-sm">{item.sortOrder}</TableCell>
                      <TableCell className="text-sm">
                        <SimpleTooltip children={item.remark} />
                      </TableCell>
                      <TableCell className="text-sm">{item.createdAt}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setInfoResp(item);
                            setViewInfoDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setInfoResp(item);
                            setEditDialogOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setInfoResp(item);
                            setUploadStudentAccountOpen(true);
                          }}
                          className="h-8 w-8"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => alert('没有实现')}
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

      {/* 班级基础信息编辑对话框 */}
      <ClassEdit open={editDialogOpen} setOpen={setEditDialogOpen} searchReq={searchReq} infoResp={infoResp} classListMutate={classListMutate} />

      {/* 导入学生账户对话框 */}
      <UploadStudentAccount open={uploadStudentDialogOpen} setOpen={setUploadStudentAccountOpen} infoResp={infoResp} />

      {/* 查看班级学生对话框 */}
      <StudentAccountList open={viewInfoDialogOpen} setOpen={setViewInfoDialogOpen} infoResp={infoResp} />
    </div>
  );
}
