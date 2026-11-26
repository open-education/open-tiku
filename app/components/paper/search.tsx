import { SimpleAlert } from '@/components/common/alert';
import CitySelect from '@/components/common/city';
import { SimpleNoData } from '@/components/common/empty';
import { ListSelect } from '@/components/common/list';
import { Loading } from '@/components/common/load';
import { ChapterExpandNav } from '@/components/common/nav';
import { SimplePagination } from '@/components/common/page';
import { YearSelect } from '@/components/common/year';
import { PaperList } from '@/components/paper/list';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useDelayedLoading } from '@/hooks/use-delayed-loading';
import { useIsMobile } from '@/hooks/use-mobile';
import type { CityResp } from '@/type/city';
import { CustomPageSource, CustomUserSource } from '@/type/enum';
import type { CountPaperResp, PaperListReq } from '@/type/paper';
import type { TextbookFillLevel } from '@/type/textbook';
import { useCityList, useCustomList, usePaperList, useTextbooks } from '@/util/fetcher';
import { formatNumber } from '@/util/fmt';
import { ArrayUtil, CustomUtil, TextbookUtil } from '@/util/object';
import { StringConst } from '@/util/string';
import { useEffect, useMemo, useState } from 'react';
import type { KeyedMutator } from 'swr';

// 试卷列表页面

interface PaperSearchListProps {
  listReq: PaperListReq;
  noDataDesc: string;
  updateListReq: (key: keyof PaperListReq, value: string | number) => void;
  countListRespMutate?: KeyedMutator<CountPaperResp[]>; // 我的试卷提交审核等操作需要重置列表状态计数接口重新请求数据
}
export default function PaperSearchList({ listReq, noDataDesc, updateListReq, countListRespMutate }: PaperSearchListProps) {
  const [fillLevel, setFillLevel] = useState<TextbookFillLevel>({
    fiveLevelKeys: [],
    eightLevelKeys: [],
  });
  const updateFillLevel = (key: keyof TextbookFillLevel, value: string[]) => {
    setFillLevel((prev) => ({ ...prev, [key]: value }));
  };

  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();

  // 用户个性化配置
  const {
    data: customListResp = [],
    isLoading: customListRespLoading,
    error: customListRespErr,
  } = useCustomList({
    userSource: CustomUserSource.Person,
    pageSource: CustomPageSource.Default,
  });
  useEffect(() => {
    CustomUtil.defaultPaperTextbookUpdate(customListResp, updateFillLevel, updateListReq);
  }, [customListResp]);

  const { data: cityListResp = [], isLoading: cityListRespLoading, error: cityListRespErr } = useCityList();
  const cityMap = useMemo(() => {
    return ArrayUtil.arrayToDict(cityListResp, 'id');
  }, [cityListResp]);

  // 查询试卷列表
  const {
    data: paperListResp = { list: [], total: 0, pageNo: 1, pageSize: StringConst.pageSize },
    isLoading: paperListRespLoading,
    error: paperListRespErr,
    mutate: paperListRespMutate,
  } = usePaperList(listReq);

  const showLoading = useDelayedLoading(textbooksIsLoading || customListRespLoading || cityListRespLoading || paperListRespLoading);

  // 左边菜单内容
  const leftContent = (
    <div className="space-y-3">
      <div className="p-3 bg-card">
        <ChapterExpandNav
          textbooks={textbooks}
          defaultValues={fillLevel.fiveLevelKeys}
          onSelectionChange={(selectedTextbooks) => {
            TextbookUtil.paperTextbookPathUpdate(selectedTextbooks, updateListReq);
          }}
        />
      </div>

      <div className="p-3 space-y-3 text-sm bg-card">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">年份:</div>
          <div className="flex min-w-0">
            <Field>
              <ButtonGroup>
                <YearSelect value={listReq.year} startYear={2020} onValueChange={(val) => updateListReq('year', val || '')} placeholder="选择年份" />
                <Button
                  variant="outline"
                  onClick={() => {
                    updateListReq('year', '');
                  }}
                >
                  重置
                </Button>
              </ButtonGroup>
            </Field>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">考试类型:</div>
          <div className="flex-1 min-w-0">
            <ListSelect options={StringConst.examTypeList} defaultValue={listReq.examType} onSelect={(val) => updateListReq('examType', val)} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">试卷级别:</div>
          <div className="flex-1 min-w-0">
            <ListSelect
              options={StringConst.paperLevelTypeList}
              defaultValue={listReq.levelType}
              onSelect={(val) => updateListReq('levelType', val)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">试卷难度:</div>
          <div className="flex-1 min-w-0">
            <ListSelect
              options={StringConst.paperDifficultyTypeList}
              defaultValue={listReq.difficultyType}
              onSelect={(val) => updateListReq('difficultyType', val)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">地区:</div>
          <div className="flex-l min-w-0">
            <Field>
              <ButtonGroup>
                <CitySelect
                  cityRespList={cityListResp}
                  provinceId={listReq.provinceId}
                  cityId={listReq.cityId}
                  onChange={(province: CityResp, city?: CityResp) => {
                    updateListReq('provinceId', province && province.id > 0 ? province.id : 0);
                    updateListReq('cityId', city && city.id > 0 ? city.id : 0);
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    updateListReq('provinceId', 0);
                    updateListReq('cityId', 0);
                  }}
                >
                  重置
                </Button>
              </ButtonGroup>
            </Field>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">学校:</div>
          <div className="flex-1 min-w-0">
            <Field>
              <ButtonGroup>
                <Input value={listReq.schoolName} placeholder="请输入学校名称" onChange={(e) => updateListReq('schoolName', e.target.value)} />
                <Button variant="outline" onClick={() => alert('单独搜索')}>
                  搜索
                </Button>
              </ButtonGroup>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );

  // 右边试卷列表
  const rightContent = (
    <div className="space-y-3">
      {/* 空数据提示 */}
      {paperListResp.total == 0 && <SimpleNoData desc={noDataDesc} />}
      {paperListResp.total > 0 && <div className="bg-card p-3">共找到 {formatNumber(paperListResp.total)} 套试卷</div>}

      <div className="space-y-2">
        {showLoading && <Loading />}
        {textbooksErr && <SimpleAlert title="菜单信息查询失败" message={textbooksErr.message} />}
        {customListRespErr && <SimpleAlert title="个性化配置信息查询失败" message={customListRespErr.message} />}
        {cityListRespErr && <SimpleAlert title="城市信息查询失败" message={cityListRespErr.message} />}
        {paperListRespErr && <SimpleAlert title="试卷列表查询失败" message={paperListRespErr.message} />}
      </div>

      <div>
        {/* 试卷列表 */}
        <div>
          <PaperList
            source={listReq.source}
            items={paperListResp.list}
            cityMap={cityMap}
            paperListRespMutate={paperListRespMutate}
            countListRespMutate={countListRespMutate}
          />
        </div>

        {/* 分页 */}
        {paperListResp.total > 0 && (
          <div className="mt-3 py-3 bg-card">
            <SimplePagination
              pageNo={paperListResp.pageNo}
              pageSize={paperListResp.pageSize}
              total={paperListResp.total}
              onPageChange={(pageNo) => {
                updateListReq('pageNo', pageNo);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // 移动端兼容
  if (useIsMobile()) {
    return (
      <div className="md:hidden flex flex-col gap-3">
        {leftContent}
        {rightContent}
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
      <ResizablePanel defaultSize="75%">
        <div className="pl-1.5">{rightContent}</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
