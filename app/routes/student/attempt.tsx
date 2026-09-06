import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import type { Route } from './+types/attempt';
import type { GenPaperResp } from '~/type/paper';
import { httpClient } from '~/util/http';
import { SimpleAlert } from '~/common/alert';
import { useDelayedLoading } from '~/hooks/delayed-loading';
import { Loading } from '~/common/load';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { PaperInfo } from '~/common/paper/list';
import { useAttemptList } from '~/util/fetcher';
import { StringConst } from '~/util/string';
import { SimplePagination } from '~/common/page';
import { GenInfoPreview } from '~/home/paper/gen/info';
import { SimpleSheet } from '~/common/sheet';
import { Separator } from '~/components/ui/separator';
import { AttemptListShow } from '~/student/test/task';
import { SimpleNoData } from '~/common/empty';

// 做题记录列表

export function meta({}: Route.MetaArgs) {
  return [
    { title: '开放题库-做题记录列表' },
    {
      name: 'description',
      content: '做题记录列表，你可以查看自己历史期间做题的感悟或笔记，方便后续复习该题。',
    },
  ];
}

// 初始化试卷信息
const defaultGenPaperResp: GenPaperResp = {
  common: {
    id: 0,
    relatedId: 0,
    relatedName: '',
    paperType: 0,
    tag: '',
    year: '',
    grade: '',
    semester: '',
    title: '',
    score: 0,
    source: '',
    remark: '',
    authorName: '',
    count: 0,
    status: 0,
    statusDesc: '',
    remarkExt: '',
    createdAt: '',
    updatedAt: '',
  },
  conf: {
    questionCateIds: [],
    questionTypes: [],
  },
  groups: [],
};

export default function Index() {
  const location = useLocation();
  const { hId, paperId } = location.state || {};

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>('');
  const [loading, setLoading] = useState(false);

  // 试卷详情
  const [genPaperResp, setGenPaperResp] = useState<GenPaperResp>(defaultGenPaperResp);
  const [genPaperLoading, setGenPaperLoading] = useState<boolean>(false);

  useEffect(() => {
    // 试卷详情
    setGenPaperLoading(true);
    httpClient
      .get<GenPaperResp>(`/paper/gen/info/${paperId}`)
      .then((res) => {
        setGenPaperResp(res);
      })
      .catch((err) => {
        setWarnInfo(<SimpleAlert title="获取试卷详情失败" message={err.message} />);
      })
      .finally(() => {
        setGenPaperLoading(false);
      });
  }, [paperId, hId]);

  const [pageNo, setPageNo] = useState(1);
  const {
    data: attemptListResp = {
      list: [],
      pageNo,
      pageSize: StringConst.pageSize,
      total: 0,
    },
    isLoading: attemptListRespLoading,
    error: attemptListRespErr,
  } = useAttemptList(hId, pageNo);

  // 点击卡片展示详情
  const handlePaperInfo = () => {
    setSheetTitle('查看详情');
    setSheetDesc('该处仅能查看明细');
    setSheetContent(<GenInfoPreview infoResp={genPaperResp} questionTypeDict={{}} questionTagDict={{}} questionDimensionDict={{}} />);
    setOpenSheet(true);
  };

  // Sheet相关操作变量
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>('');
  const [sheetDesc, setSheetDesc] = useState<string>('');
  const [sheetContent, setSheetContent] = useState<React.ReactNode>('');

  return (
    <div className="p-4 space-y-4 bg-muted">
      {warnInfo}

      {useDelayedLoading(genPaperLoading || attemptListRespLoading || loading) && <Loading />}

      {attemptListRespErr && <SimpleAlert title="做题记录获取失败" message={attemptListRespErr.message} />}

      {/* 试卷信息 */}
      <div>
        <Card
          className="group flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-150"
          onClick={() => {
            handlePaperInfo();
          }}
        >
          <CardHeader>
            <CardTitle className="text-sm font-bold">作业概览信息</CardTitle>
            <CardDescription>点击可查看试卷详情</CardDescription>
          </CardHeader>
          <PaperInfo commonResp={genPaperResp.common} />
        </Card>
      </div>

      {/* 做题记录列表 */}
      <div>
        <Card className="group flex flex-col cursor-pointer hover:border-primary/30 hover:shadow-md transition-all duration-150">
          <CardHeader>
            <CardTitle className="text-sm font-bold">做题记录列表</CardTitle>
            <CardDescription>点击可查看做题详情</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-3.5 flex flex-col h-full">
            <Separator />

            <div>
              {attemptListResp.total > 0 ? (
                <AttemptListShow
                  genPaperResp={genPaperResp}
                  listResp={attemptListResp.list}
                  setOpenSheet={setOpenSheet}
                  setSheetTitle={setSheetTitle}
                  setSheetDesc={setSheetDesc}
                  setSheetContent={setSheetContent}
                />
              ) : (
                <SimpleNoData desc="做题记录为空" />
              )}
            </div>
          </CardContent>
          <CardFooter className="px-4 py-3.5 flex flex-col h-full">
            {attemptListResp.total > 0 && (
              <SimplePagination
                pageNo={attemptListResp.pageNo}
                pageSize={attemptListResp.pageSize}
                total={attemptListResp.total}
                onPageChange={(pageNo) => setPageNo(pageNo)}
              />
            )}
          </CardFooter>
        </Card>
      </div>

      <div>
        <SimpleSheet openSheet={openSheet} setOpenSheet={setOpenSheet} sheetTitle={sheetTitle} sheetDesc={sheetDesc} sheetContent={sheetContent} />
      </div>
    </div>
  );
}
