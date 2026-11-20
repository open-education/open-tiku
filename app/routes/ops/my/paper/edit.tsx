import { GlobalError } from '@/components/common/error';
import { Loading } from '@/components/common/load';
import Add from '@/components/paper/add';
import type { PaperAddReq, PaperResp } from '@/type/paper';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/edit';

/// 编辑试卷

export function meta({}: Route.MetaArgs) {
  return [
    { title: '编辑试卷' },
    {
      name: 'description',
      content: '编辑我草稿中的试卷',
    },
  ];
}

export default function Index() {
  const [searchParams] = useSearchParams();
  const pId = ObjectUtil.strToNumber(searchParams.get('id'));

  const [infoResp, setInfoResp] = useState<PaperResp | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pId <= 0) return;

    let isCancelled = false;
    setLoading(true);
    setErrorMsg(null);

    httpClient
      .get<PaperResp>(`/paper/info/${pId}`)
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
  }, [pId]);

  const initAddReq = useMemo<PaperAddReq | null>(() => {
    if (infoResp && infoResp.id > 0) {
      return {
        ...infoResp,
      };
    }
    return null;
  }, [infoResp]);

  if (pId <= 0) {
    return <GlobalError message="401" details="无法访问该页面" />;
  }

  if (loading) {
    return <Loading />;
  }

  if (errorMsg || !initAddReq) {
    return <GlobalError message="401" details={errorMsg || '试卷编辑访问出现错误'} />;
  }

  return <Add key={pId} initAddReq={initAddReq} />;
}
