import { CheckCircle, Eye, Flag, PenTool } from 'lucide-react';
import { NavLink } from 'react-router';
import { TagShow } from '~/common/paper/tag';
import { Button } from '~/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { TestMethod } from '~/type/enum';
import type { GenPaperResp } from '~/type/paper';
import type { AttemptInfoResp, TestInfoResp } from '~/type/test';
import { DateUtil } from '~/util/object';
import { PreviewEaxm } from './exam';

// 一个任务列表
interface ListShowProps {
  listResp: TestInfoResp[];
}

function ListShow({ listResp }: ListShowProps) {
  return (
    <>
      {/* 任务列表 */}
      {listResp.map((item) => {
        const isCompleted = 0 == item.paperInfo.count;
        // 是否截止今日
        const isUrgent = DateUtil.isTodayLocal(item.deadline);
        // 是否允许继续做题
        const allowExam = !DateUtil.isBeforeToday(item.deadline);

        return (
          <div
            key={item.id}
            onClick={() => {}}
            className="px-4 py-3 border-t border-gray-100 flex items-center gap-2.5 cursor-pointer transition-colors duration-100 hover:bg-gray-100"
          >
            {/* 左侧状态图标容器 */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCompleted ? 'bg-green-50 text-green-600' : isUrgent ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isCompleted ? (
                <CheckCircle size={15} className="currentColor" />
              ) : isUrgent ? (
                <Flag size={15} className="currentColor" />
              ) : (
                <PenTool size={15} className="currentColor" />
              )}
            </div>

            {/* 中间文本与进度条 */}
            <InfoShow infoResp={item} />

            <div className="flex gap-3 text-xs">
              {allowExam && (
                <div>
                  <Button variant="link">
                    <NavLink to={'/student/exam'} state={{ hId: item.id, paperId: item.paperInfo.id, examMethod: TestMethod.Exercise }}>
                      练习模式
                    </NavLink>
                  </Button>
                  <Button variant="link">
                    <NavLink to={'/student/exam'} state={{ hId: item.id, paperId: item.paperInfo.id, examMethod: TestMethod.Exam }}>
                      考试模式
                    </NavLink>
                  </Button>
                </div>
              )}
            </div>

            <Button variant="link">
              <NavLink to={'/student/attempt'} state={{ hId: item.id, paperId: item.paperInfo.id }}>
                历史记录
              </NavLink>
            </Button>

            {/* 右侧紧急标签与箭头 */}
            {isUrgent && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold shrink-0">截止今天</span>}
            {!allowExam && <span className="text-xs px-1.5 py-0.5 rounded bg-rose-50 text-blue-600 font-semibold shrink-0">已截止</span>}
          </div>
        );
      })}
    </>
  );
}

// 试卷标题详情展示
interface InfoShowProps {
  infoResp: TestInfoResp;
}

function InfoShow({ infoResp }: InfoShowProps) {
  return (
    <div className="flex-1 min-w-0 space-y-3">
      {/* 生成标签 */}
      <div className="flex flex-wrap gap-3 items-center w-full">
        <TagShow
          relatedName={infoResp.paperInfo.relatedName ?? ''}
          tag={infoResp.paperInfo.tag}
          year={infoResp.paperInfo.year}
          grade={infoResp.paperInfo.grade ?? ''}
          semester={infoResp.paperInfo.semester ?? ''}
        />
      </div>
      <p className="font-medium text-gray-800 truncate">{infoResp.paperInfo.title}</p>
      <div className="flex items-center gap-4 mt-1">
        <p className="text-sm text-gray-400 shrink-0">
          {infoResp.paperInfo.authorName} · {0}/{infoResp.paperInfo.count}题
        </p>
        {/* 进度条背景 */}
        <div className="flex-1 h-0.75 bg-gray-100">
          {/* 进度条高亮 */}
          <div className="h-0.75 bg-blue-200 transition-all duration-300" style={{ width: `${(10 / infoResp.paperInfo.count) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// 做题记录列表信息
interface AttemptListShowProps {
  genPaperResp: GenPaperResp;
  listResp: AttemptInfoResp[];

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;
}

function AttemptListShow({ genPaperResp, listResp, setOpenSheet, setSheetTitle, setSheetContent, setSheetDesc }: AttemptListShowProps) {
  // 预览做题记录明细
  const handleExamPreview = (item: AttemptInfoResp) => {
    setSheetTitle('查看做题明细');
    setSheetDesc('查看历史做题记录');
    setSheetContent(<PreviewEaxm attemptResp={item} genPaperResp={genPaperResp} />);
    setOpenSheet(true);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-sm font-semibold">ID</TableHead>
          <TableHead className="text-sm font-semibold">做题次数</TableHead>
          <TableHead className="text-sm font-semibold">状态</TableHead>
          <TableHead className="text-sm font-semibold">完成题数</TableHead>
          <TableHead className="text-sm font-semibold">做题方式</TableHead>
          <TableHead className="text-sm font-semibold">开始时间</TableHead>
          <TableHead className="text-sm font-semibold">更新时间</TableHead>
          <TableHead className="text-sm font-semibold">完成时间</TableHead>
          <TableHead className="text-sm font-semibold">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {listResp.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
              暂无做题记录
            </TableCell>
          </TableRow>
        ) : (
          listResp.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-sm">{item.id}</TableCell>
              <TableCell className="text-sm">第{item.attemptNumber}次</TableCell>
              <TableCell className="text-sm">{item.statusDesc}</TableCell>
              <TableCell className="text-sm">{item.answers.length}</TableCell>
              <TableCell className="text-sm">{item.methodDesc}</TableCell>
              <TableCell className="text-sm">{item.createdAt}</TableCell>
              <TableCell className="text-sm">{item.updatedAt}</TableCell>
              <TableCell className="text-sm">{item.completedAt}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    handleExamPreview(item);
                  }}
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

export { ListShow, InfoShow, AttemptListShow };
