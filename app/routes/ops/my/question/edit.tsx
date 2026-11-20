import { GlobalError } from '@/components/common/error';
import { Loading } from '@/components/common/load';
import Add from '@/components/question/add';
import { QuestionEditMode, QuestionRelationType } from '@/type/enum';
import type { CreateQuestionReq, QuestionInfoResp } from '@/type/question';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/edit';

/// 编辑题目或添加变式题

export function meta({}: Route.MetaArgs) {
  return [
    { title: '编辑题目或添加变式题' },
    {
      name: 'description',
      content: '编辑我草稿中的题目或添加变式题',
    },
  ];
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const qId = ObjectUtil.strToNumber(searchParams.get('id'));
  const type = ObjectUtil.strToNumber(searchParams.get('type'));

  const [infoResp, setInfoResp] = useState<QuestionInfoResp | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (qId <= 0 || type <= 0) return;

    let isCancelled = false;
    setLoading(true);
    setErrorMsg(null);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${qId}`)
      .then((res) => {
        if (!isCancelled) {
          setInfoResp(res);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setErrorMsg(err?.message || '获取题目详情失败');
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [qId, type]);

  const initAddReq = useMemo<CreateQuestionReq | null>(() => {
    if (infoResp && infoResp.baseInfo?.id > 0) {
      if (type === QuestionEditMode.Edit) {
        return {
          ...infoResp.baseInfo,
          difficultyLevel: Number(infoResp.baseInfo.difficultyLevel),
          ...infoResp.extraInfo,
        };
      } else if (type === QuestionEditMode.AddSimilar) {
        return {
          twoLevelId: infoResp.baseInfo.twoLevelId,
          fiveLevelId: infoResp.baseInfo.fiveLevelId,
          questionCateId: infoResp.baseInfo.questionCateId,
          questionTypeId: 0,
          originalName: '',
          title: '',
          difficultyLevel: 1.0,
          optionsLayout: 1,
          source: '',
          status: 0,
          relationType: QuestionRelationType.Similar, // 添加变式题
          levelId: 0,
          sourceId: qId,
        };
      }
    }
    return null;
  }, [infoResp]);

  if (qId <= 0 || type <= 0) {
    return <GlobalError message="401" details="无法访问该页面" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (errorMsg || !initAddReq) {
    return <GlobalError message="401" details={errorMsg || '编辑题目或添加变式题访问出现错误'} />;
  }

  return <Add key={type === QuestionEditMode.Edit ? qId : `${qId}-add-similar`} initAddReq={initAddReq} />;
}
