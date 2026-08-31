import { ChevronsUpDown, ListFilterPlus, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { SimpleAlert } from "~/common/alert";
import { Loading } from "~/common/load";
import { SimplePagination } from "~/common/page";
import { SimpleTooltip } from "~/common/tooltip";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Textarea } from "~/components/ui/textarea";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import type { ClassInfoResp, ClassSearchReq, ClassStudentResp } from "~/type/class";
import type { HomeworkAddReq, HomeworkListSearchReq } from "~/type/homework";
import type { CommonPaperResp } from "~/type/paper";
import { SearchConfig } from "~/user/class/config";
import { useClassList, useClassStudentList, usePaperHomeworkList } from "~/util/fetcher";
import { httpClient } from "~/util/http";
import { StringConst, StringValidator } from "~/util/string";

// 布置作业, 只有手动组卷才需要布置作业

interface PublishHomeworkProps {
  setOpenSheet: (value: boolean) => void;
  genInfoResp: CommonPaperResp;
}

const defaultHomeworkAddReq: HomeworkAddReq = {
  batchNo: 0,
  paperId: 0,
  title: "",
  remark: "",
  classMap: {},
};

// 搜索默认值
const defaultSearchReq: ClassSearchReq = {
  year: "",
  grade: "",
  semester: "",
};

function PublishHomework({ setOpenSheet, genInfoResp }: PublishHomeworkProps) {
  const [addReq, setAddReq] = useState<HomeworkAddReq>(defaultHomeworkAddReq);

  useEffect(() => {
    if (genInfoResp && genInfoResp.id > 0) {
      setAddReq((prev) => ({ ...prev, paperId: genInfoResp.id }));
    }
  }, [genInfoResp]);

  const updateAddReq = (key: keyof HomeworkAddReq, val: number | string) => {
    setAddReq((prev) => ({ ...prev, [key]: val }));
  };

  // 获取我的班级
  const [searchReq, setSearchReq] = useState<ClassSearchReq>(defaultSearchReq);
  const updateSearchReq = (key: keyof ClassSearchReq, value: string) => {
    setSearchReq((prev) => ({ ...prev, [key]: value }));
  };

  // 班级列表
  const {
    data: classListResp = {
      list: [],
      pageNo: 1,
      pageSize: 30,
      total: 0,
    },
    isLoading: classListLoading,
    error: classListErr,
    mutate: classListMutate,
  } = useClassList(searchReq, 1);
  const classIds: number[] = useMemo(() => {
    return classListResp.list.map((s) => s.id);
  }, [classListResp]);

  // 获取班级的所有学生账户
  const { data: classStudentMap = {}, isLoading: classStudentMapLoading, error: classStudentMapErr } = useClassStudentList(classIds);

  // 选中的班级及对应的学生ID列表
  // key: classId, value: studentIds
  const [selectedMap, setSelectedMap] = useState<Map<number, number[]>>(new Map());

  // 判断某个班级是否为"全班发布"
  const isFullClass = (classId: number) => {
    const students = classStudentMap[classId] || [];
    const ids = selectedMap.get(classId) || [];
    return ids.length === students.length;
  };

  // 获取某个班级已选的学生数量(用于底部汇总 + 行内提示)
  const getSelectedCount = (classId: number) => {
    const ids = selectedMap.get(classId) ?? [];
    return ids.length;
  };

  // 获取总班级数 + 总学生数(底部汇总用)
  const getTotalStats = () => {
    let totalStudents = 0;
    for (const [classId, studentIds] of selectedMap.entries()) {
      if (studentIds.length === 0) {
        totalStudents += classStudentMap[classId]?.length || 0;
      } else {
        totalStudents += studentIds.length;
      }
    }
    return {
      classCount: selectedMap.size,
      studentCount: totalStudents,
    };
  };
  const stats = getTotalStats();

  // 选择学生对话框
  const [selectStudentDialogOpen, setSelectStudentDialogOpen] = useState<boolean>(false);
  const [selectClassInfoResp, setSelectClassInfoResp] = useState<ClassInfoResp | null>(null);
  const [studentListResp, setStudentListResp] = useState<ClassStudentResp[] | null>(null);
  const [defaultSelectIds, setDefaultSelectIds] = useState<number[]>([]);

  // 添加布置作业
  const [addSaving, setAddSaving] = useState<boolean>(false);
  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");
  const handleSubmit = async () => {
    setWarnInfo("");

    // 试卷
    if (addReq.paperId <= 0) {
      toast.error(<div className="text-red-700">参数错误: 试卷信息不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }

    // 标题
    if (!StringValidator.isNonEmpty(addReq.title)) {
      toast.error(<div className="text-red-700">参数错误: 标题不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    // 班级和班级内学生账户不能为空
    if (selectedMap.size == 0) {
      toast.error(<div className="text-red-700">参数错误: 班级不能为空</div>, {
        duration: Infinity,
        action: {
          label: "关闭",
          onClick: () => {},
        },
      });
      return;
    }
    for (const value of selectedMap.values()) {
      if (value.length == 0) {
        toast.error(<div className="text-red-700">参数错误: 有班级内学生账号为空</div>, {
          duration: Infinity,
          action: {
            label: "关闭",
            onClick: () => {},
          },
        });
        return;
      }
    }

    // 布置作业
    setAddSaving(true);

    // 获取批次号
    try {
      let paperId = addReq.paperId;
      const batchNo = await httpClient.get<number>(`/homework/${paperId}/batchNo`);

      // 结构出请求参数
      let req: HomeworkAddReq = {
        ...addReq,
        batchNo: batchNo,
        classMap: Object.fromEntries(selectedMap),
      };
      const res = await httpClient.post<boolean>("/homework/add", req);

      // 添加成功则清空选择的默认值
      if (res) {
        setAddReq({ ...defaultHomeworkAddReq });
        setSelectedMap(new Map());
        setSelectClassInfoResp(null);
        setStudentListResp(null);
        setDefaultSelectIds([]);

        // 关闭抽屉
        setOpenSheet(false);
      }
    } catch (error) {
      const err = error as Error;
      setWarnInfo(<SimpleAlert title="布置作业失败" message={err.message} />);
    } finally {
      setAddSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="text-sm">
        <div>1. 作业每次布置都是新的任务, 不会覆盖也不会删除历史布置的作业任务</div>
        <div>2. 默认只展示最新的 30 条班级信息, 如果你管理的班级较多请增加搜索条件, 如果还是不展示可以反馈给网站管理员</div>
        <div>3. 先选择班级再选择学生</div>
      </div>

      <Separator />

      <div className="flex gap-3">
        <Button className="text-sm" disabled={addSaving} onClick={handleSubmit}>
          <Save />
          {addSaving ? "保存中..." : "保存"}
        </Button>
      </div>

      {/* 展示接口提交错误 */}
      <div>{warnInfo}</div>

      <Separator />

      {/* 错误提示 */}
      {classListErr && <SimpleAlert title="班级列表获取失败" message={classListErr.message} />}

      {classStudentMapErr && <SimpleAlert title="班级学生列表获取失败" message={classStudentMapErr.message} />}

      {/* 加载中 */}
      {useDelayedLoading(classListLoading || classStudentMapLoading) && <Loading />}

      {/* 搜索配置 */}
      <div className="text-sm">
        <SearchConfig searchReq={searchReq} updateSearchReq={updateSearchReq} />
      </div>

      <Separator />

      {/* 标题 */}
      <div className="flex gap-3 items-center">
        <div className="text-sm w-20">标题:</div>
        <Input
          className="text-sm w-full md:w-1/3"
          value={addReq.title}
          onChange={(e) => updateAddReq("title", e.target.value)}
          placeholder="例如 第5批次布置作业"
        />
      </div>

      <Separator />

      {/* 表格 */}
      <div className="mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={classListResp.list.length > 0 && classListResp.list.every((item) => selectedMap.has(item.id))}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const newMap = new Map<number, number[]>();
                      classListResp.list.forEach((item) => {
                        const students = classStudentMap[item.id] || [];
                        newMap.set(
                          item.id,
                          students.map((s) => s.id),
                        );
                      });
                      setSelectedMap(newMap);
                    } else {
                      setSelectedMap(new Map());
                    }
                  }}
                />
              </TableHead>
              <TableHead className="text-sm font-semibold">ID</TableHead>
              <TableHead className="text-sm font-semibold">年份</TableHead>
              <TableHead className="text-sm font-semibold">年级</TableHead>
              <TableHead className="text-sm font-semibold">学期</TableHead>
              <TableHead className="text-sm font-semibold">名称</TableHead>
              <TableHead className="text-sm font-semibold">发布范围</TableHead>
              <TableHead className="text-sm font-semibold">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classListResp.list.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                  暂无数据，请去 我的班级 点击 新增 添加班级和学生后再布置作业
                </TableCell>
              </TableRow>
            ) : (
              classListResp.list.map((item) => {
                const students = classStudentMap[item.id] || [];
                const isSelected = selectedMap.has(item.id);
                const selectedCount = getSelectedCount(item.id);
                const isFull = isFullClass(item.id);

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const newMap = new Map(selectedMap);
                          if (checked) {
                            newMap.set(
                              item.id,
                              students.map((s) => s.id),
                            );
                          } else {
                            newMap.delete(item.id);
                          }
                          setSelectedMap(newMap);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-sm">{item.id}</TableCell>
                    <TableCell className="text-sm">{item.year}</TableCell>
                    <TableCell className="text-sm">{item.grade}</TableCell>
                    <TableCell className="text-sm">{item.semester}</TableCell>
                    <TableCell className="text-sm">{item.label}</TableCell>
                    <TableCell>
                      {isSelected ? (
                        <span className="text-sm">
                          {isFull ? (
                            <span className="text-green-600">全班 {selectedCount}人</span>
                          ) : (
                            <span className="text-blue-600">已选 {selectedCount} 人</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">未选中</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        disabled={!isSelected}
                        onClick={() => {
                          setSelectClassInfoResp(item);
                          const students = classStudentMap[item.id] || [];
                          setStudentListResp(students);
                          const currentIds = selectedMap.get(item.id) || [];
                          setDefaultSelectIds(currentIds);
                          setSelectStudentDialogOpen(true);
                        }}
                      >
                        <ListFilterPlus />
                        选择学生
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="text-sm text-center">
        选择概览: 共选择班级: {stats.classCount} 个, 学生: {stats.studentCount} 人
      </div>

      <Separator />

      <div className="flex gap-3 items-center">
        <div className="text-sm w-20">备注:</div>
        <Textarea
          className="text-sm min-h-19 resize-y w-full md:w-1/3"
          value={addReq.remark}
          onChange={(e) => updateAddReq("remark", e.target.value)}
          placeholder="请输入备注信息"
        />
      </div>

      {/* 显示选择学生弹框 */}
      {selectStudentDialogOpen &&
        selectClassInfoResp &&
        selectClassInfoResp.id > 0 &&
        studentListResp &&
        studentListResp.length > 0 &&
        createPortal(
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center" onClick={() => setSelectStudentDialogOpen(false)}>
            <div className="bg-white w-[70vw] flex flex-col shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
                <div className="text-base font-semibold text-gray-800">选择学生</div>
                <button
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  onClick={() => setSelectStudentDialogOpen(false)}
                  aria-label="关闭"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 内容区域 */}
              <SelectStudentList
                setSelectStudentDialogOpen={setSelectStudentDialogOpen}
                label={selectClassInfoResp.label}
                studentListResp={studentListResp}
                defaultSelectIds={defaultSelectIds}
                onSubmit={(ids: number[]) => {
                  setSelectedMap((prevMap) => {
                    const newMap = new Map(prevMap);
                    newMap.set(selectClassInfoResp.id, ids);
                    return newMap;
                  });
                }}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

// 选择学生组件
interface SelectStudentListProps {
  setSelectStudentDialogOpen: (value: boolean) => void;
  label: string;
  studentListResp: ClassStudentResp[];
  defaultSelectIds: number[];
  onSubmit: (values: number[]) => void;
}

function SelectStudentList({ setSelectStudentDialogOpen, label, studentListResp, defaultSelectIds, onSubmit }: SelectStudentListProps) {
  // 用 Set 存储选中的学生 id
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set(defaultSelectIds));

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

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="space-y-3">
        <p>
          已选择班级：<span className="text-base font-semibold">{label}</span>
        </p>
      </div>

      <Separator />

      <div className="min-h-120 overflow-y-auto">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => {
            setSelectStudentDialogOpen(false);
          }}
        >
          取消
        </Button>
        <Button
          className="text-sm"
          onClick={() => {
            onSubmit([...selectedIds]);
            setSelectStudentDialogOpen(false);
          }}
        >
          确认
        </Button>
      </div>
    </div>
  );
}

// 查看作业列表
interface HomeworkListProps {
  paperId: number;
}

const defaultSearchListReq: HomeworkListSearchReq = {
  paperId: 0,
  batchNo: 0,
};

function HomeworkList({ paperId }: HomeworkListProps) {
  const [searchReq, setSearchReq] = useState<HomeworkListSearchReq>(defaultSearchListReq);
  const updateSearchReq = (key: keyof HomeworkListSearchReq, value: number) => {
    setSearchReq((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    updateSearchReq("paperId", paperId);
  }, [paperId]);

  const [pageNo, setPageNo] = useState<number>(1);
  const {
    data: listResp = { list: [], pageNo, pageSize: StringConst.pageSize, total: 0 },
    isLoading: listRespLoading,
    error: listRespErr,
  } = usePaperHomeworkList(searchReq, pageNo);

  // 查看学生明细
  const rowClass = "flex items-center gap-4 px-4 py-2 border-b";
  const [selectHkId, setSelectHkId] = useState<number>(0);

  return (
    <div className="p-4 space-y-3 text-sm">
      <Separator />

      {/* 批次 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">批次:</div>
        <div className="flex-1 min-w-0">
          <Input
            type="number"
            value={searchReq.batchNo || 0}
            onChange={(e) => {
              updateSearchReq("batchNo", Number(e.target.value));
            }}
            className="text-sm md:text-sm w-full md:w-1/3" // 移动端全宽，PC端1/3宽度
          />
        </div>
      </div>

      <div>{useDelayedLoading(listRespLoading) && <Loading />}</div>

      <div>{listRespErr && <SimpleAlert title="作业布置列表查询失败" message={listRespErr.message} />}</div>

      <Separator />

      <div className="min-h-120 overflow-y-auto">
        <div className={`${rowClass} text-sm font-medium`}>
          <div className="w-20 shrink-0 font-semibold">批次</div>
          <div className="flex-1 font-semibold">标题</div>
          <div className="flex-1 font-semibold">备注</div>
          <div className="flex-1 font-semibold">班级信息</div>
          <div className="flex-1 font-semibold">创建时间</div>
          <div className="w-45 shrink-0 font-semibold">操作</div>
        </div>
        {listResp.list.length === 0 ? (
          <div className="text-center text-sm py-8">暂无作业布置列表</div>
        ) : (
          listResp.list.map((item) => (
            <div key={item.id} className="border-b last:border-b-0">
              <Collapsible open={item.id === selectHkId}>
                <div className={`${rowClass} text-sm`}>
                  <div className="w-20 shrink-0">{item.batchNo}</div>
                  <div className="flex-1">{item.title}</div>
                  <div className="flex-1">{item.remark}</div>
                  <div className="flex-1">
                    {[item.classInfo.year, item.classInfo.grade, item.classInfo.semester, item.classInfo.label].filter(Boolean).join("-")}
                  </div>
                  <div className="flex-1">{item.createdAt}</div>
                  <div className="w-45 shrink-0">
                    <CollapsibleTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => {
                            // 二次点击收起
                            setSelectHkId(selectHkId === item.id ? 0 : item.id);
                          }}
                        >
                          <ChevronsUpDown />
                          <span className="sr-only">Toggle details</span>
                        </Button>
                      }
                    />
                  </div>
                </div>

                {/* 学生账户列表 */}
                <CollapsibleContent className="p-8 bg-gray-50 border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-sm font-semibold">账号</TableHead>
                        <TableHead className="text-sm font-semibold">状态</TableHead>
                        <TableHead className="text-sm font-semibold">最后登录时间</TableHead>
                        <TableHead className="text-sm font-semibold">登录次数</TableHead>
                        <TableHead className="text-sm font-semibold">备注</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.students.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-sm">
                            暂无学生账户
                          </TableCell>
                        </TableRow>
                      ) : (
                        item.students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="text-sm">{student.account}</TableCell>
                            <TableCell className="text-sm">{student.statusDesc}</TableCell>
                            <TableCell className="text-sm">{student.lastLoginTime}</TableCell>
                            <TableCell className="text-sm">{student.loginCount}</TableCell>
                            <TableCell className="text-sm">
                              <SimpleTooltip children={student.remark || "-"} />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {listResp.total > 0 && (
        <div className="mt-3">
          <SimplePagination
            pageNo={listResp.pageNo}
            pageSize={listResp.pageSize}
            total={listResp.total}
            onPageChange={(pageNo) => {
              setPageNo(pageNo);
            }}
          />
        </div>
      )}
    </div>
  );
}

export { PublishHomework, HomeworkList };
