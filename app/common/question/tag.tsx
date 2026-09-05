import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type {
  QuestionApproveReq,
  QuestionDeleteReq,
  QuestionInfoResp,
  QuestionListResp,
  QuestionPageSourceProps,
  QuestionSearch,
} from '~/type/question';
import type { TextbookOtherDict } from '~/type/textbook';
import { httpClient } from '~/util/http';
import { QuestionInfo } from '~/common/question/info';
import { SimilarQuestionList } from '~/home/question/similar';
import Add from '~/home/question/add';
import { toast } from 'sonner';
import { StringConst } from '~/util/string';
import { useState } from 'react';
import { Textarea } from '~/components/ui/textarea';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { QuestionRelationType, QuestionStatus, UserRoleType } from '~/type/enum';
import type { KeyedMutator } from 'swr';
import type { UserInfoResp } from '~/type/user';
import { useUserInfo } from '~/hooks/use-user';
import { Slider } from '~/components/ui/slider';
import type { GenDifficultyLevelRange } from '~/type/paper';
import { Separator } from '~/components/ui/separator';

/// 题目题目相关标签选择器

interface TypeSelectProps {
  /** 标签选项数组 */
  options: TextbookOtherDict[];
  /** 默认选中的标签（可选） */
  value?: number;
  /** 选中标签时的回调，返回选中的文本 */
  onSelect: (value: number) => void;
}

// 搜索编辑等题目类型选择器
function TypeSelect({ options, value = 0, onSelect }: TypeSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (value === val) {
      onSelect(0);
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <Button key={option.id} className="text-sm" variant={value === option.id ? 'default' : 'outline'} onClick={() => handleSelect(option.id)}>
          {option.itemValue}
        </Button>
      ))}
    </div>
  );
}

interface MultiTagSelectProps {
  /** 标签数据列表 */
  options: TextbookOtherDict[];
  /** 当前选中的 id 列表（受控） */
  value: number[];
  /** 选中值变化时的回调 */
  onChange: (selectedIds: number[]) => void;
}

// 多选题目标签选择器
function MultiTagSelect({ options, value = [], onChange }: MultiTagSelectProps) {
  const handleToggle = (id: number) => {
    let newSelectedIds: number[];
    if (value.includes(id)) {
      newSelectedIds = value.filter((item) => item !== id);
    } else {
      newSelectedIds = [...value, id];
    }
    onChange(newSelectedIds);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option.id);
        return (
          <Button
            key={option.id}
            className="text-sm"
            type="button"
            variant={isSelected ? 'default' : 'outline'}
            onClick={() => handleToggle(option.id)}
          >
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

// 题目状态选择器
interface StatusSelectProps {
  defaultValue?: number;
  onSelect: (val: number) => void;
}
function StatusSelect({ defaultValue = 0, onSelect }: StatusSelectProps) {
  const handleSelect = (val: number) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.questionStatusList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 题目类型选择题
interface OtherDictSelectProps {
  defaultValue?: string;
  onSelect: (val: string) => void;
}
function OtherDictSelect({ defaultValue, onSelect }: OtherDictSelectProps) {
  const handleSelect = (val: string) => {
    // 点击相同项时取消选中（行为可选）
    if (defaultValue === val) {
      return;
    }
    onSelect(val);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {StringConst.questionOtherDictList.map(({ id, value, label }) => (
        <Button key={id} className="text-sm" variant={defaultValue === value ? 'default' : 'outline'} onClick={() => handleSelect(value)}>
          {label}
        </Button>
      ))}
    </div>
  );
}

// 列表详情等标签展示
// 题目类型标签
// 题目本身的标签
// 难度标签
// 题目状态标签
interface TagShowProps {
  pageSource: QuestionPageSourceProps;
  typeValue: string;
  tagNames: string[];
  dimensionNames: string[];
  difficultyLevelValue: number;
  status: number;
}
function TagShow({ pageSource, typeValue, tagNames, dimensionNames, difficultyLevelValue, status }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    // 题目类型
    const typeNode: React.ReactNode = (
      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-sm" key={typeValue}>
        {typeValue}
      </Badge>
    );

    // 题目标签
    const tagNode = tagNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-sm" key={val}>
          {val}
        </Badge>
      );
    });

    // 核心素养
    const dimensionNode = dimensionNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 text-sm" key={val}>
          {val}
        </Badge>
      );
    });

    // 难度
    const difficultyNode = (
      <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 text-sm" key={difficultyLevelValue}>
        {difficultyLevelValue}
      </Badge>
    );

    // 我的审核和题目需要展示题目状态
    const statusDesc =
      pageSource.source !== 'list' ? (
        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-sm" key={status}>
          {StringConst.questionStatusList[status].label || '草稿中'}
        </Badge>
      ) : (
        ''
      );

    return (
      <>
        {typeNode}
        {tagNode}
        {dimensionNode}
        {difficultyNode}
        {statusDesc}
      </>
    );
  };

  return <>{getBadges()}</>;
}

// 查看题目详情编辑等标签操作
interface OperateTagsProps {
  pageSource: QuestionPageSourceProps;
  questionId: number; // 题目主键
  questionRelationType: number; // 题目类型
  eightId: number; // 第8层题型标识
  status: number; // 题目状态
  questionTypeDict: Record<number, TextbookOtherDict>;
  questionTagDict: Record<number, TextbookOtherDict>;
  questionDimensionDict: Record<number, TextbookOtherDict>;
  questionSearch: QuestionSearch;
  questionListRespMutate: KeyedMutator<QuestionListResp>;

  // 以下为 Sheet 操作方法和属性
  setOpenSheet: (value: boolean) => void;
  setSheetTitle: (value: string) => void;
  setSheetDesc: (value: string) => void;
  setSheetContent: (value: React.ReactNode) => void;

  // 提示加载中
  setLoading?: (value: boolean) => void;
}
function OperateTags({
  pageSource,
  questionId,
  questionRelationType,
  eightId,
  status,
  questionTypeDict,
  questionTagDict,
  questionDimensionDict,
  questionSearch,
  questionListRespMutate,
  setOpenSheet,
  setSheetTitle,
  setSheetDesc,
  setSheetContent,
  setLoading,
}: OperateTagsProps) {
  // 查看详情
  const handleViewInfo = () => {
    setLoading?.(true);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${questionId}`)
      .then((res) => {
        setSheetTitle('查看详情');
        setSheetDesc('');
        setSheetContent(
          <QuestionInfo
            pageSource={pageSource}
            questionTypeDict={questionTypeDict}
            questionTagDict={questionTagDict}
            questionDimensionDict={questionDimensionDict}
            infoResp={res}
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">查询题目详情出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 编辑详情
  const handleEditInfo = () => {
    setLoading?.(true);

    httpClient
      .get<QuestionInfoResp>(`/question/info/${questionId}`)
      .then((res) => {
        setSheetTitle('编辑详情');
        setSheetDesc('编辑题目信息');
        setSheetContent(
          <Add
            questionSearch={questionSearch}
            setSheetTitle={setSheetTitle}
            setSheetDesc={setSheetDesc}
            setSheetContent={setSheetContent}
            infoResp={res} // 编辑时详情是最高优先级, 会覆盖其它值
            questionListRespMutate={questionListRespMutate} // 编辑完毕需要刷新列表
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">编辑查询题目详情出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 添加课本原题
  const handleOriginalTextbookAdd = () => {
    // 将当前题目主键作为变式题的父题标识
    const initSearch: QuestionSearch = { ...questionSearch, sourceId: questionId };

    setSheetTitle('添加课本原题');
    setSheetDesc('题目需要借助其它 ai 工具转为 markdown 源格式文档后使用; 仅母题可添加课本原题');
    setSheetContent(
      <Add
        questionSearch={initSearch}
        addRelationType={QuestionRelationType.Original}
        setSheetTitle={setSheetTitle}
        setSheetDesc={setSheetDesc}
        setSheetContent={setSheetContent}
      />,
    );
    setOpenSheet(true);
  };

  // 添加变式题
  const handleSimilarAdd = () => {
    // 变式题将当前题目主键作为变式题的父题标识
    const initSearch: QuestionSearch = { ...questionSearch, sourceId: questionId };

    setSheetTitle('添加变式题');
    setSheetDesc('题目需要借助其它 ai 工具转为 markdown 源格式文档后使用');
    setSheetContent(
      <Add
        questionSearch={initSearch}
        addRelationType={QuestionRelationType.Similar}
        setSheetTitle={setSheetTitle}
        setSheetDesc={setSheetDesc}
        setSheetContent={setSheetContent}
      />,
    );
    setOpenSheet(true);
  };

  // 查看课本原题
  const handleOriginalTextbook = () => {
    setLoading?.(true);

    // 通过题目关联关系获取到详情标识
    httpClient
      .post<QuestionInfoResp>('question/original', { id: questionId, relationType: questionRelationType })
      .then((res) => {
        setSheetTitle('查看 课本原题 详情');
        setSheetDesc('一道母题只能关联一道课本原题, 变式题不能关联课本原题');
        setSheetContent(
          <QuestionInfo
            pageSource={pageSource}
            questionTypeDict={questionTypeDict}
            questionTagDict={questionTagDict}
            questionDimensionDict={questionDimensionDict}
            infoResp={res}
          />,
        );
        setOpenSheet(true);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">查询课本原题出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
      });
  };

  // 查看变式题列表
  const handleSimilarList = () => {
    setSheetTitle('变式题列表');
    setSheetDesc('变式题暂不支持查看详情');
    setSheetContent(
      <SimilarQuestionList
        questionTypeDict={questionTypeDict}
        questionTagDict={questionTagDict}
        questionDimensionDict={questionDimensionDict}
        questionId={questionId}
        eightId={eightId}
      />,
    );
    setOpenSheet(true);
  };

  // 提交审核
  const [openSubmitApprove, setOpenSubmitApprove] = useState<boolean>(false);
  const [submitApproving, setSubmitApproving] = useState<boolean>(false);

  const handleSubmitApprove = () => {
    setLoading?.(true);
    setSubmitApproving(true);

    const req: QuestionApproveReq = {
      id: questionId,
      status: QuestionStatus.Pending,
      rejectReason: '',
    };
    httpClient
      .post('/edit/question/status', req)
      .then((res) => {
        questionListRespMutate();
        setOpenSubmitApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">提交审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
        setSubmitApproving(false);
      });
  };

  // 审核题目
  const [openConfirmApprove, setOpenConfirmApprove] = useState<boolean>(false);
  const [confirmApproving, setConfirmApproving] = useState<boolean>(false);

  const [approveReq, setApproveReq] = useState<QuestionApproveReq>({
    id: questionId,
    status: QuestionStatus.Drafing,
    rejectReason: '',
  });
  const updateApproveReq = (key: keyof QuestionApproveReq, value: number | string) => {
    setApproveReq((prev) => ({ ...prev, [key]: value }));
  };

  const handleApprove = () => {
    setLoading?.(true);
    setConfirmApproving(true);

    httpClient
      .post('/edit/question/status', approveReq)
      .then((res) => {
        questionListRespMutate();
        setOpenConfirmApprove(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">审核操作出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
        setConfirmApproving(false);
      });
  };

  // 删除题目
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const handleDelete = () => {
    setLoading?.(true);
    setDeleting(true);

    const req: QuestionDeleteReq = {
      id: questionId,
    };

    httpClient
      .post('/question/delete', req)
      .then((res) => {
        questionListRespMutate();
        setOpenDelete(false);
      })
      .catch((err) => {
        toast.error(<div className="text-red-700">删除题目出错: {err.message}</div>);
      })
      .finally(() => {
        setLoading?.(false);
        setDeleting(false);
      });
  };

  // 题目标签按钮处理
  const renderButtons = (source: string, questionRelationType: number) => {
    // 获取用户信息
    const currentUser: UserInfoResp | null = useUserInfo();
    const notStudent = currentUser !== null && currentUser.role !== UserRoleType.Student;

    // 详情按钮-所有地方均有
    const buttons = [
      <Button key="detail" variant="link" onClick={handleViewInfo}>
        详情
      </Button>,
    ];

    // 提交审核
    // 我的题目页面状态为草稿中才会出现提交审核
    if (currentUser && source === 'myQuestion' && status === QuestionStatus.Drafing) {
      buttons.push(
        <Dialog key="myQuestionSubmit" open={openSubmitApprove} onOpenChange={setOpenSubmitApprove}>
          <DialogTrigger render={<Button variant="link">提交审核</Button>} />
          <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">提交审核</DialogTitle>
              <DialogDescription className="text-sm">请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="p-4 space-y-3">
              <div className="text-sm font-semibold">检查步骤</div>
              <div className="text-sm">
                <p>1. 题目不能是抄袭的, 避免投诉和版权纠纷</p>
                <p>2. 题目本身信息要完整</p>
                <p>3. 图片等信息不能缺失</p>
                <p>4. 题目和答案本身要符合常识</p>
              </div>
            </div>

            <Separator />

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleSubmitApprove} disabled={submitApproving}>
                {submitApproving ? '提交审核中' : '提交审核'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    // 审核题目
    // 我的审核页面状态为待审核的数据才会出现审核按钮
    if (currentUser && source === 'myReview' && status === QuestionStatus.Pending) {
      buttons.push(
        <Dialog key="myReviewApprove" open={openConfirmApprove} onOpenChange={setOpenConfirmApprove}>
          <DialogTrigger render={<Button variant="link">审核</Button>} />
          <DialogContent className="w-200! max-w-[90vw]! flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">题目审核</DialogTitle>
              <DialogDescription className="text-sm">请确认题目没有包含违规, 涉黄, 侵权和法律法规不允许传播的信息等内容</DialogDescription>
            </DialogHeader>

            <Separator />

            <div className="space-y-3 p-4">
              <div className="text-sm font-semibold">检查步骤</div>
              <div className="text-sm">
                <p>1. 题目不能是抄袭的, 避免投诉和版权纠纷</p>
                <p>2. 题目本身信息要完整</p>
                <p>3. 图片等信息不能缺失</p>
                <p>4. 题目和答案本身要符合常识</p>
                <p>5. 若你审核通过的题目后续被投诉等纠纷较多, 我们有权利降低你的账号等级</p>
              </div>
            </div>

            <Separator />

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
                <span className="text-sm text-right">审核状态:</span>
                <StatusSelect defaultValue={approveReq.status} onSelect={(val) => updateApproveReq('status', val)} />

                <span className="text-sm text-right">拒绝理由:</span>
                <Textarea
                  value={approveReq.rejectReason}
                  className="text-sm"
                  onChange={(e) => updateApproveReq('rejectReason', e.target.value)}
                  placeholder="拒绝时需要说明拒绝原因"
                />
              </div>
            </div>

            <Separator />

            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleApprove} disabled={confirmApproving}>
                {confirmApproving ? '审核中' : '审核'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    // 编辑, 审核不能编辑别人的信息, 更不能自己编辑自己审核
    if (currentUser && pageSource.source !== 'myReview' && notStudent) {
      buttons.push(
        <Button key="edit" variant="link" onClick={handleEditInfo}>
          编辑
        </Button>,
      );
    }

    // 变式题课本原题只有母题可添加
    if (currentUser && source === 'list' && questionRelationType === QuestionRelationType.Base && notStudent) {
      buttons.push(
        <Button key="originalTextbook" variant="link" onClick={handleOriginalTextbookAdd}>
          添加课本原题
        </Button>,
        <Button key="similar" variant="link" onClick={handleSimilarAdd}>
          添加变式题
        </Button>,
      );
    }

    // 非课本原题才查看课本原题
    if (questionRelationType !== QuestionRelationType.Original) {
      buttons.push(
        <Button key="originalTextbookInfo" variant="link" onClick={handleOriginalTextbook}>
          查看课本原题
        </Button>,
      );
    }

    // 查看变式题, 只有母题有变式题
    if (questionRelationType === QuestionRelationType.Base) {
      buttons.push(
        <Button key="similarList" variant="link" onClick={handleSimilarList}>
          查看变式题
        </Button>,
      );
    }

    // 我的题目可以删除题目
    if (source === 'myQuestion') {
      buttons.push(
        <Dialog key="myQuestionDelete" open={openDelete} onOpenChange={setOpenDelete}>
          <DialogTrigger render={<Button variant="link">删除</Button>} />
          <DialogContent className="w-auto! max-w-[90vw]! min-w-75">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">删除题目</DialogTitle>
              <DialogDescription className="text-sm">题目删除后不可恢复, 如果不确定, 可以保留等后续确认后再删除</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose
                render={
                  <Button variant="outline" className="text-sm">
                    Cancel
                  </Button>
                }
              />
              <Button className="text-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? '删除中' : '删除'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>,
      );
    }

    return buttons;
  };

  return renderButtons(pageSource.source, questionRelationType);
}

// 难度等级范围
interface DifficultyLevelProps {
  levelRange: GenDifficultyLevelRange;
  setLevelRange: (val: GenDifficultyLevelRange) => void;
}
function ShowDifficultyLevelRange({ levelRange, setLevelRange }: DifficultyLevelProps) {
  const update = (key: keyof GenDifficultyLevelRange, val: number) => {
    const total = levelRange.basic + levelRange.improve + levelRange.expand - levelRange[key];
    const remaining = 100 - val;

    if (total === 0) {
      setLevelRange({
        basic: key === 'basic' ? val : remaining / 2,
        improve: key === 'improve' ? val : remaining / 2,
        expand: key === 'expand' ? val : remaining / 2,
      });
    } else {
      const ratio = remaining / total;
      setLevelRange({
        basic: key === 'basic' ? val : Math.round(levelRange.basic * ratio),
        improve: key === 'improve' ? val : Math.round(levelRange.improve * ratio),
        expand: key === 'expand' ? val : Math.round(levelRange.expand * ratio),
      });
    }
  };

  return (
    <div className="border p-3 text-sm">
      <div className=" space-y-4">
        <div>
          <div className="flex justify-between mb-1.5">
            <span>
              基础题 <span className="text-gray-400">(1 - 3)</span>
            </span>
            <span className="font-medium">{levelRange.basic}%</span>
          </div>
          <Slider value={[levelRange.basic]} onValueChange={(v) => update('basic', Array.isArray(v) ? v[0] : v)} max={100} step={1} />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span>
              提升题 <span className="text-gray-400">(3.5 - 4)</span>
            </span>
            <span className="font-medium">{levelRange.improve}%</span>
          </div>
          <Slider value={[levelRange.improve]} onValueChange={(v) => update('improve', Array.isArray(v) ? v[0] : v)} max={100} step={1} />
        </div>

        <div>
          <div className="flex justify-between mb-1.5">
            <span>
              扩展题 <span className="text-gray-400">(4.5 - 5)</span>
            </span>
            <span className="font-medium">{levelRange.expand}%</span>
          </div>
          <Slider value={[levelRange.expand]} onValueChange={(v) => update('expand', Array.isArray(v) ? v[0] : v)} max={100} step={1} />
        </div>
      </div>

      <div className="pt-2 border-t mt-2 flex justify-between">
        <span>合计: {levelRange.basic + levelRange.improve + levelRange.expand}%</span>
        <span>难度 1 → 5</span>
      </div>
    </div>
  );
}

export { TypeSelect, MultiTagSelect, StatusSelect, OtherDictSelect, TagShow, OperateTags, ShowDifficultyLevelRange };
