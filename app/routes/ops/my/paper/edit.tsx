import { GlobalError } from '@/components/common/error';
import Upload from '@/components/paper/upload';
import { PaperStatus } from '@/type/enum';
import type { PaperAddReq, PaperResp } from '@/type/paper';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
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

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const pId = ObjectUtil.strToNumber(url.searchParams.get('id'));

  if (pId <= 0) {
    return { error: '无法访问该页面', initAddReq: null, pId };
  }

  try {
    const res = await httpClient.get<PaperResp>(`/paper/info/${pId}`);
    if (!res || res.id <= 0) {
      return { error: '试卷数据不存在', initAddReq: null, pId };
    }
    const initAddReq: PaperAddReq = {
      ...res,
      // 如果是已拒绝的编辑重置状态为草稿中
      status: res.status === PaperStatus.Rejected ? PaperStatus.Drafting : res.status,
    };
    return { error: null, initAddReq, pId };
  } catch (err: any) {
    return { error: err?.message || '获取试卷详情失败', initAddReq: null, pId };
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { error, initAddReq, pId } = loaderData;

  if (error || !initAddReq) {
    return <GlobalError message="401" details={error || '试卷编辑访问出现错误'} />;
  }

  return <Upload key={pId} initAddReq={initAddReq} />;
}
