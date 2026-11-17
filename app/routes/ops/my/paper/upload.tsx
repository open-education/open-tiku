import { ChapterExpandNav } from '@/components/common/nav';
import { YearSelect } from '@/components/common/year';
import { DifficultyTypeSelect, ExamTypeSelect, FileTypeSelect, LevelTypeSelect } from '@/components/paper/tag';
import FileUpload from '@/components/paper/upload';
import { Button } from '@/components/ui/button';
import { FieldDescription } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { CustomPageSource, CustomUserSource, QuestionStatus, UploadFileType } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import { useCustomList, useTextbooks } from '@/util/fetcher';
import { Check, Save, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Route } from './+types/upload';
import { CustomUtil } from '@/util/object';

export function meta({}: Route.MetaArgs) {
  return [
    { title: '上传试卷' },
    {
      name: 'description',
      content: '收集整理网站常见的疑问和做一些适当的说明',
    },
  ];
}

export default function Index() {
  // 搜索对象维护
  const [questionSearch, setQuestionSearch] = useState<QuestionSearch>({
    twoLevelId: 0,
    fiveLevelId: 0,
    fiveLevelSelectKeys: [],
    eightIds: [],
    eightLevelSelectKeys: [],
    typeId: 0,
    tagIds: [],
    dimensionIds: [],
    levelIds: [],
    sceneIds: [],
    mistakeTipIds: [],
    status: QuestionStatus.Published,
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();

  // 用户个性化配置
  const { data: customListResp = [], isLoading: customListRespLoading, error: customListRespErr } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.updateSearchFiveLevelInfo(customListResp, updateQuestionSearch);
  }, [customListResp]);

  // 左边选择试卷关联关系
  const leftContent = (
    <div className="bg-card p-3">
      <ChapterExpandNav textbooks={textbooks} defaultValues={questionSearch.fiveLevelSelectKeys} onSelectionChange={() => {
      }} />
    </div>
  );

  // 中间文件上传区域
  const middleContent = (
    <div className="bg-card p-3 space-y-3">
      <div className="space-y-3 text-sm bg-card">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">文件类型:</div>
          <div className="flex-1 min-w-0">
            <FileTypeSelect onSelect={(val) => {
            }} />
          </div>
        </div>
      </div>

      <div>
        <FileUpload fileType={UploadFileType.Image} />
      </div>
    </div>
  );

  // 右边试卷识别信息维护
  const [year, setYear] = useState<string>('');

  const Required = () => <span className="text-destructive">*</span>;

  const FieldRow = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: any }) => (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-sm">
        {label} <Required />
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
        <Button>
          <Save className="mr-2 h-4 w-4" />
          存入草稿
        </Button>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          提交审核
        </Button>
      </div>

      <div>
        <Separator />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm">
          试卷名称 <Required />
        </Label>
        <Textarea id="title" className="min-h-25 resize-y" value="" onChange={() => {
        }} placeholder="输入试卷名称..." />
        <Button size="sm" variant="outline">
          识别试卷名称
        </Button>
        <FieldDescription>✨ AI 已自动识别试卷名称，未识别或识别失败请手动输入</FieldDescription>
      </div>

      <FieldRow label="省市区学校">
        <div className="text-xs">省市区学校联动待补充</div>
      </FieldRow>

      <FieldRow label="选择学年">
        <YearSelect value={year} startYear={2020} onValueChange={() => {
        }} placeholder="选择学年" />
      </FieldRow>

      <FieldRow label="考试类型">
        <ExamTypeSelect defaultValue={1} onSelect={() => {
        }} />
      </FieldRow>

      <FieldRow label="试卷级别">
        <LevelTypeSelect defaultValue={1} onSelect={() => {
        }} />
      </FieldRow>

      <FieldRow label="试卷难度">
        <DifficultyTypeSelect defaultValue={1} onSelect={() => {
        }} />
      </FieldRow>

      <div className="space-y-2">
        <Label htmlFor="desc" className="text-sm">
          试卷说明
        </Label>
        <Textarea id="desc" className="min-h-25 resize-y" value="" onChange={() => {
        }} placeholder="输入试卷说明..." />
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
