import { SimpleAlert } from '@/components/common/alert';
import CitySelect from '@/components/common/city';
import { ListSelect } from '@/components/common/list';
import { Loading } from '@/components/common/load';
import { ChapterExpandNav } from '@/components/common/nav';
import FileUpload from '@/components/common/upload';
import { YearSelect } from '@/components/common/year';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CityResp } from '@/type/city';
import { CustomPageSource, CustomUserSource, PaperStatus, TextbookFillLevelType, UploadFileType } from '@/type/enum';
import type { FinalUploadItem } from '@/type/file';
import type { FileInfo, PaperAddReq } from '@/type/paper';
import type { TextbookFillLevel, TextbookResp } from '@/type/textbook';
import { useCityList, useCustomList, useTextbooks } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { CustomUtil, ObjectUtil, TextbookUtil } from '@/util/object';
import { StringConst, StringUtil } from '@/util/string';
import { Check, Save, Send } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

interface UploadProps {
  initAddReq: PaperAddReq;
}
export default function Upload({ initAddReq }: UploadProps) {
  const navigate = useNavigate();

  // 是否是添加
  const isAdd = !initAddReq.id || initAddReq.id <= 0;

  // 如果是编辑处理文件默认值
  const [defaultFileList, setDefaultFileList] = useState<FinalUploadItem[]>([]);
  useEffect(() => {
    if (isAdd || !initAddReq.fileList || initAddReq.fileList.length <= 0) return;
    const items: FinalUploadItem[] = initAddReq.fileList.map((item) => ({
      id: ObjectUtil.createId(),
      resp: {
        originalName: item.name,
        name: item.url,
        size: item.size,
        url: item.url,
      },
      isImage: initAddReq.fileType === UploadFileType.Image,
    }));
    setDefaultFileList(items);
  }, [isAdd, initAddReq]);

  const [fillLevel, setFillLevel] = useState<TextbookFillLevel>({
    fiveLevelKeys: [],
    eightLevelKeys: [],
  });
  const updateFillLevel = (key: keyof TextbookFillLevel, value: string[]) => {
    setFillLevel((prev) => ({ ...prev, [key]: value }));
  };

  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  const pathMap = useMemo(() => {
    if (isAdd || textbooks.length === 0) {
      return new Map<string, TextbookResp[]>();
    }
    return TextbookUtil.createTextbookPathDict(textbooks);
  }, [isAdd, textbooks]);

  // 用户个性化配置
  const {
    data: customListResp = [],
    isLoading: customListRespLoading,
    error: customListRespErr,
  } = useCustomList(
    {
      userSource: CustomUserSource.Person,
      pageSource: CustomPageSource.Default,
    },
    isAdd,
  );
  useEffect(() => {
    if (isAdd || customListResp.length > 0) {
      CustomUtil.defaultPaperTextbookUpdate(customListResp, updateFillLevel, updateAddReq);
    }
  }, [isAdd, customListResp]);
  // 非试卷添加时需要用题目本身的信息去初始化菜单
  useEffect(() => {
    if (isAdd || pathMap.size === 0 || !StringUtil.isNonEmpty(initAddReq.textbookPath)) {
      return;
    }
    CustomUtil.editInitTextbookUpdate(TextbookFillLevelType.Five, TextbookUtil.getPathId(initAddReq.textbookPath, 4), pathMap, updateFillLevel);
  }, [isAdd, pathMap, initAddReq.textbookPath]);

  const [addReq, setAddReq] = useState<PaperAddReq>(initAddReq);
  const updateAddReq = (key: keyof PaperAddReq, value: string | number | number[] | string[] | FileInfo[]) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };

  const { data: cityRespList = [], isLoading: cityRespListLoading, error: cityRespListErr } = useCityList();

  const showLoading = useDelayedLoading(textbooksIsLoading || customListRespLoading || cityRespListLoading);

  // 提交试卷
  const [addDraftIng, setAddDraftIng] = useState<boolean>(false);
  const [addApproving, setAddApproving] = useState<boolean>(false);
  const [addErr, setAddErr] = useState<React.ReactNode>(null);
  const handleSubmit = (status: PaperStatus) => {
    if (!StringUtil.isNonEmpty(addReq.textbookPath)) {
      toast.error(<div className="text-red-700">菜单科目不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.fileList && addReq.fileList.length === 0) {
      toast.error(<div className="text-red-700">试卷文件不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.fileList && addReq.fileList.length > 5) {
      toast.error(<div className="text-red-700">试卷文件不能超过5个</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringUtil.isNonEmpty(addReq.title)) {
      toast.error(<div className="text-red-700">试卷名称不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (!StringUtil.isNonEmpty(addReq.year)) {
      toast.error(<div className="text-red-700">学年不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.examType && addReq.examType <= 0) {
      toast.error(<div className="text-red-700">考试类型不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }
    if (addReq.levelType && addReq.levelType <= 0) {
      toast.error(<div className="text-red-700">试卷级别不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    if (addReq.difficultyType && addReq.difficultyType <= 0) {
      toast.error(<div className="text-red-700">试卷难度不能为空</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setAddDraftIng(status === PaperStatus.Drafting);
    setAddApproving(status === PaperStatus.Pending);
    setAddErr(null);

    httpClient
      .post<number>('/paper/upload/add', addReq)
      .then((_) => {
        // 添加成功去我的试卷列表页面
        navigate('/ops/my/paper', { replace: true });
      })
      .catch((err) => {
        setAddErr(<SimpleAlert title="保存出现错误" message={err.message} />);
      })
      .finally(() => {
        setAddDraftIng(false);
        setAddApproving(false);
      });
  };

  // 左边选择试卷关联关系
  const leftContent = (
    <div className="bg-card p-3">
      <ChapterExpandNav
        textbooks={textbooks}
        defaultValues={fillLevel.fiveLevelKeys}
        onSelectionChange={(selectedTextbooks) => {
          TextbookUtil.paperTextbookPathUpdate(selectedTextbooks, updateAddReq);
        }}
      />
    </div>
  );

  // 中间文件上传区域
  const middleContent = (
    <div className="bg-card p-3 space-y-3">
      <div className="space-y-3 text-sm bg-card">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">文件类型:</div>
          <div className="flex-1 min-w-0">
            <ListSelect options={StringConst.uploadFileTypeList} defaultValue={addReq.fileType} onSelect={(val) => updateAddReq('fileType', val)} />
          </div>
        </div>
      </div>

      <div>
        <FileUpload
          fileType={addReq.fileType}
          defaultList={defaultFileList}
          onChange={(values) => {
            if (!values) return;
            updateAddReq(
              'fileList',
              values
                .filter((item) => item.resp && item.resp.size > 0)
                .map(({ resp }, idx) => ({
                  id: idx + 1,
                  name: resp.originalName,
                  url: resp.url,
                  size: resp.size,
                })),
            );
          }}
        />
      </div>
    </div>
  );

  // 右边试卷识别信息维护
  const CurRequired = () => <span className="text-destructive">*</span>;

  const CurFieldRow = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: any }) => (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm">
        {label} <CurRequired />
      </Label>
      {children}
    </div>
  );

  const rightContent = (
    <div className="bg-card p-3 space-y-3">
      <div className="space-y-2 text-sm">
        <div>1. AI 能识别部分信息，如果填充不完整，需手动补全信息</div>
        <div>2. 我们会尝试从你上传的第一张图片中识别试卷名称，并解析省份和学校等信息，但不保证能成功完成</div>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => handleSubmit(PaperStatus.Drafting)} disabled={addDraftIng}>
          <Save className="mr-2 h-4 w-4" />
          {addDraftIng ? '存入草稿中...' : '存入草稿'}
        </Button>
        <Button variant="outline" onClick={() => handleSubmit(PaperStatus.Pending)} disabled={addApproving}>
          <Send className="mr-2 h-4 w-4" />
          {addApproving ? '提交审核中...' : '提交审核'}
        </Button>
      </div>

      <div>
        <Separator />
      </div>

      <div className="space-y-2">
        {showLoading && <Loading />}
        {textbooksErr && <SimpleAlert title="菜单获取失败" message={textbooksErr.message} />}
        {customListRespErr && <SimpleAlert title="个性化配置获取失败" message={customListRespErr.message} />}
        {cityRespListErr && <SimpleAlert title="城市信息获取失败" message={cityRespListErr.message} />}
        {addErr}
      </div>

      <div className="space-y-2">
        <Label htmlFor="paper-title" className="text-sm">
          试卷名称 <CurRequired />
        </Label>
        <Textarea
          id="paper-title"
          className="min-h-25 resize-y"
          value={addReq.title}
          onChange={(e) => updateAddReq('title', e.target.value)}
          placeholder="输入试卷名称..."
        />
        <Button size="sm" variant="outline" onClick={() => alert('后续接入ai识别')}>
          点击识别试卷名称
        </Button>
        <FieldDescription>✨ AI 已自动识别试卷名称，未识别或识别失败请手动输入</FieldDescription>
      </div>

      <CurFieldRow label="选择省和城市">
        <CitySelect
          cityRespList={cityRespList}
          provinceId={addReq.provinceId}
          cityId={addReq.cityId}
          onChange={(province: CityResp, city?: CityResp) => {
            updateAddReq('provinceId', province && province.id > 0 ? province.id : 0);
            updateAddReq('cityId', city && city.id > 0 ? city.id : 0);
          }}
        />
      </CurFieldRow>

      <div className="space-y-2">
        <Label htmlFor="paper-school-name" className="text-sm">
          学校名称
        </Label>
        <Textarea
          id="paper-school-name"
          className="min-h-25 resize-y"
          value={addReq.schoolName}
          onChange={(e) => updateAddReq('schoolName', e.target.value)}
          placeholder="输入学校名称..."
        />
        <FieldDescription>学校名称本期手动输入</FieldDescription>
      </div>

      <CurFieldRow label="选择学年">
        <YearSelect value={addReq.year} startYear={2020} onValueChange={(val) => updateAddReq('year', val || '')} placeholder="选择学年" />
      </CurFieldRow>

      <CurFieldRow label="考试类型">
        <ListSelect options={StringConst.examTypeList} defaultValue={addReq.examType} onSelect={(val) => updateAddReq('examType', val)} />
      </CurFieldRow>

      <CurFieldRow label="试卷级别">
        <ListSelect options={StringConst.paperLevelTypeList} defaultValue={addReq.levelType} onSelect={(val) => updateAddReq('levelType', val)} />
      </CurFieldRow>

      <CurFieldRow label="试卷难度">
        <ListSelect
          options={StringConst.paperDifficultyTypeList}
          defaultValue={addReq.difficultyType}
          onSelect={(val) => updateAddReq('difficultyType', val)}
        />
      </CurFieldRow>

      <div className="space-y-2">
        <Label htmlFor="paper-add-desc" className="text-sm">
          试卷说明
        </Label>
        <Textarea
          id="paper-add-desc"
          className="min-h-25 resize-y"
          value={addReq.remark}
          onChange={(e) => updateAddReq('remark', e.target.value)}
          placeholder="输入试卷说明..."
        />
      </div>

      <div className="mt-6 mb-5 flex items-center gap-2.5 bg-emerald-50 px-4.5 py-3.5 text-[13px] text-emerald-700">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-emerald-500">
          <Check className="h-4 w-4" />
        </div>
        提交后由教研员审核，审核通过后进入试卷库，供全国一线教师免费使用
      </div>
    </div>
  );

  // 手机端
  if (useIsMobile()) {
    return (
      <div className="space-y-3">
        <div>{leftContent}</div>
        <div>{middleContent}</div>
        <div>{rightContent}</div>
      </div>
    );
  }

  // PC 端
  return (
    <ResizablePanelGroup orientation="horizontal" className="border flex-col! md:flex-row!">
      <ResizablePanel defaultSize="25%">
        <div className="pr-1.5">{leftContent}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="25%">
        <div className="pl-1.5 pr-1.5">{middleContent}</div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="50%">
        <div className="pl-1.5">{rightContent}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
