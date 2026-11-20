import { GlobalError } from '@/components/common/error';
import Add from '@/components/question/add';
import { QuestionEditMode, QuestionRelationType } from '@/type/enum';
import type { CreateQuestionReq, QuestionInfoResp } from '@/type/question';
import { httpClient } from '@/util/http';
import { ObjectUtil } from '@/util/object';
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

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const qId = ObjectUtil.strToNumber(url.searchParams.get('id'));
  const type = ObjectUtil.strToNumber(url.searchParams.get('type'));

  // 提前校验 URL 参数合法性
  if (qId <= 0 || (type !== QuestionEditMode.Edit && type !== QuestionEditMode.AddSimilar)) {
    return {
      error: '无法访问该页面',
      initAddReq: null,
      componentKey: '',
    };
  }

  try {
    const infoResp = await httpClient.get<QuestionInfoResp>(`/question/info/${qId}`);

    if (!infoResp || !infoResp.baseInfo || infoResp.baseInfo.id <= 0) {
      return {
        error: '题目详情不存在',
        initAddReq: null,
        componentKey: '',
      };
    }

    // 根据编辑模式组装初始表单数据
    let initAddReq: CreateQuestionReq;

    if (type === QuestionEditMode.Edit) {
      initAddReq = {
        ...infoResp.baseInfo,
        difficultyLevel: Number(infoResp.baseInfo.difficultyLevel),
        ...infoResp.extraInfo,
      };
    } else {
      initAddReq = {
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

    return {
      error: null,
      initAddReq,
      componentKey: type === QuestionEditMode.Edit ? `${qId}` : `${qId}-add-similar`,
    };
  } catch (err: any) {
    return {
      error: err?.message || '获取题目详情失败',
      initAddReq: null,
      componentKey: '',
    };
  }
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { error, initAddReq, componentKey } = loaderData;

  if (error || !initAddReq) {
    return <GlobalError message="401" details={error || '编辑题目或添加变式题访问出现错误'} />;
  }

  return <Add key={componentKey} initAddReq={initAddReq} />;
}
