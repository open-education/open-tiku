import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import type { Route } from "./+types/attempt";
import type { GenPaperResp } from "~/type/paper";
import { httpClient } from "~/util/http";
import { SimpleAlert } from "~/common/alert";
import { useDelayedLoading } from "~/hooks/delayed-loading";
import { Loading } from "~/common/load";

// 做题记录列表

export function meta({}: Route.MetaArgs) {
  return [
    { title: "开放题库-做题记录列表" },
    {
      name: "description",
      content: "做题记录列表，你可以查看自己历史期间做题的感悟或笔记，方便后续复习该题。",
    },
  ];
}

// 初始化试卷信息
const defaultGenPaperResp: GenPaperResp = {
  common: {
    id: 0,
    relatedId: 0,
    relatedName: "",
    paperType: 0,
    tag: "",
    year: "",
    grade: "",
    semester: "",
    title: "",
    score: 0,
    source: "",
    remark: "",
    authorName: "",
    count: 0,
    status: 0,
    statusDesc: "",
    remarkExt: "",
    createdAt: "",
    updatedAt: "",
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

  const [warnInfo, setWarnInfo] = useState<React.ReactNode>("");

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

  return (
    <div className="px-4 py-4 sm:px-16 sm:py-4 space-y-4">
      {warnInfo}

      {useDelayedLoading(genPaperLoading) && <Loading />}

      <div>试卷信息</div>
    </div>
  );
}
