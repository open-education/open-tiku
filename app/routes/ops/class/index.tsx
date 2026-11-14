import ClassAdd from '@/components/class/add';
import { StudentList } from '@/components/class/student';
import UploadStudentAccount from '@/components/class/upload';
import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { SimplePagination } from '@/components/common/page';
import { SimpleTooltip } from '@/components/common/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { ClassInfoResp, ClassSearchReq } from '@/type/class';
import { useClassList } from '@/util/fetcher';
import { StringConst } from '@/util/string';
import { Eye, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { Fragment, useState } from 'react';
import type { Route } from './+types/index';

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

  const showLoading = useDelayedLoading(classListLoading);

  // 当前正在查看的班级详情
  const [viewClassId, setViewClassId] = useState<number | null>(null);

  return (
    <div className="bg-card">
      <Card className="w-full">
        <CardHeader className="flex flex-row justify-between space-y-0">
          <CardTitle className="text-base font-semibold">我的班级管理</CardTitle>
          <Button
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
          <div className="text-sm space-y-2">
            <div>
              1. 目前发送学生账户密码的邮件抬头是:&nbsp;
              <span className="text-blue-600 text-sm font-semibold">
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
          <div className="text-base mt-3">{/* <SearchConfig searchReq={searchReq} updateSearchReq={updateSearchReq} /> */}</div>

          <div className="mt-3">
            <Separator />
          </div>

          {/* 错误提示 */}
          {classListErr && <SimpleAlert title="班级列表获取失败" message={classListErr.message} />}

          {/* 加载中 */}
          {showLoading && <Loading />}

          {/* 表格 */}
          <div className="mt-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-sm">ID</TableHead>
                  <TableHead className="text-sm">年份</TableHead>
                  <TableHead className="text-sm">年级</TableHead>
                  <TableHead className="text-sm">学期</TableHead>
                  <TableHead className="text-sm">名称</TableHead>
                  <TableHead className="text-sm">邮箱</TableHead>
                  <TableHead className="text-sm">排序</TableHead>
                  <TableHead className="text-sm">备注</TableHead>
                  <TableHead className="text-sm">创建时间</TableHead>
                  <TableHead className="text-sm">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classListResp.list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                      暂无数据，点击 新增 添加
                    </TableCell>
                  </TableRow>
                ) : (
                  classListResp.list.map((item) => {
                    const isOpen = item.id === viewClassId;

                    return (
                      <Fragment key={item.id}>
                        <TableRow data-state={isOpen ? 'open' : 'closed'}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.year}</TableCell>
                          <TableCell>{item.grade}</TableCell>
                          <TableCell>{item.semester}</TableCell>
                          <TableCell>{item.label}</TableCell>
                          <TableCell>
                            <SimpleTooltip children={item.email} />
                          </TableCell>
                          <TableCell>{item.sortOrder}</TableCell>
                          <TableCell>
                            <SimpleTooltip children={item.remark} />
                          </TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                          <TableCell className="flex">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-expanded={isOpen}
                              onClick={() => {
                                setInfoResp(item);
                                setViewClassId(isOpen ? null : item.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setInfoResp(item);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setInfoResp(item);
                                setUploadStudentAccountOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => alert('没有实现')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* 展开学生账户列表 */}
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={10} className="p-0">
                            <Collapsible open={isOpen}>
                              <CollapsibleContent
                                className="
                                overflow-hidden transition-all
                                data-[state=closed]:animate-collapsible-up
                                data-[state=open]:animate-collapsible-down
                                "
                              >
                                <StudentList infoResp={item} />
                              </CollapsibleContent>
                            </Collapsible>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页信息 */}
          {classListResp.total > 0 && (
            <div className="my-3">
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
      {editDialogOpen && (
        <ClassAdd open={editDialogOpen} setOpen={setEditDialogOpen} searchReq={searchReq} infoResp={infoResp} classListMutate={classListMutate} />
      )}

      {/* 导入学生账户对话框 */}
      {uploadStudentDialogOpen && infoResp && (
        <UploadStudentAccount open={uploadStudentDialogOpen} setOpen={setUploadStudentAccountOpen} infoResp={infoResp} />
      )}
    </div>
  );
}
