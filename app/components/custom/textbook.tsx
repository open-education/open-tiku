import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { ChapterExpandNav } from '@/components/common/nav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { CustomAddReq, CustomTextbook } from '@/type/custom';
import { CustomPageSource, CustomType, CustomUserSource } from '@/type/enum';
import type { QuestionSearch } from '@/type/question';
import type { TextbookResp } from '@/type/textbook';
import { useCustomList, useTextbooks } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { TextbookUtil } from '@/util/object';
import { Save } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

// 教材层级配置

interface TextbookProps {
  userSource: CustomUserSource;
  pageSource: CustomPageSource;
}

export default function Textbook({ userSource, pageSource }: TextbookProps) {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();
  // 将教材字典转化为 Map 格式, 存储 id 对应的所有层
  const pathMap = useMemo(() => {
    return TextbookUtil.createTextbookPathDict(textbooks);
  }, [textbooks]);

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
  });
  const updateQuestionSearch = (key: keyof QuestionSearch, value: number | number[] | string[]) => {
    setQuestionSearch((prev) => ({ ...prev, [key]: value }));
  };

  // 添加信息请求
  const [addReq, setAddReq] = useState<CustomAddReq>({
    userSource,
    customType: CustomType.Textbook,
    textbook: {},
  });
  const updateAddReq = (key: keyof CustomAddReq, value: number | CustomTextbook) => {
    setAddReq((prev) => ({ ...prev, [key]: value }));
  };
  const updateTextbook = (patch: Partial<CustomTextbook>) => {
    setAddReq((prev) => ({
      ...prev,
      textbook: { ...(prev.textbook ?? {}), ...patch },
    }));
  };

  useEffect(() => {
    TextbookUtil.updateSearchTwoLevelId(questionSearch.fiveLevelId, pathMap, updateQuestionSearch);
  }, [questionSearch.fiveLevelId, pathMap]);

  // 用户个性化配置
  const { data: customListResp = [], isLoading: customListRespLoading, error: customListRespErr } = useCustomList({ userSource, pageSource });
  useEffect(() => {
    // 如果存在预设默认值则覆盖初始化值
    const customTextbook = customListResp.find((item) => item.customType === CustomType.Textbook);
    if (!customTextbook) {
      return;
    }

    // 记录主键
    updateAddReq('id', customTextbook.id);

    if (customTextbook.textbook) {
      updateAddReq('textbook', customTextbook.textbook);
      // 更新默认显示
      if (customTextbook.textbook.fifth && customTextbook.textbook.fifth > 0) {
        updateQuestionSearch('fiveLevelId', customTextbook.textbook.fifth);
      }
      if (customTextbook.textbook.fifthKeys && customTextbook.textbook.fifthKeys.length > 0) {
        updateQuestionSearch('fiveLevelSelectKeys', customTextbook.textbook.fifthKeys);
      }
    }
  }, [customListResp]);

  const showLoading = useDelayedLoading(textbooksIsLoading || customListRespLoading);

  const [addIng, setAddIng] = useState<boolean>(false);
  const [addErr, setAddErr] = useState<React.ReactNode>(null);

  // 保存默认选择
  const handleSubmit = () => {
    if (!addReq.textbook) {
      toast.error(<div className="text-red-700">没有选择任何配置</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {
          },
        },
      });
      return;
    }
    // 前5层级至少选择到第二层
    if (!addReq.textbook.fifthKeys || addReq.textbook.fifthKeys.length < 2) {
      toast.error(<div className="text-red-700">前5层级最少需要选择到第二层科目</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {
          },
        },
      });
      return;
    }

    setAddIng(true);
    setAddErr(null);

    httpClient
      .post('/custom/add', addReq)
      .then((res) => {
        // 添加成功提示即可
        toast.info(<div className="text-blue-700">添加成功，可去其它页面查看默认菜单是否正确</div>);
        return;
      })
      .catch((err) => {
        setAddErr(<SimpleAlert title="添加默认菜单出错" message={err.message} />);
      })
      .finally(() => {
        setAddIng(false);
      });
  };

  return (
    <div className="bg-card">
      <div className="text-sm space-y-2 p-3">
        <div>前5层级菜单定制后，后续涉及菜单类的页面均使用该信息作为默认选择</div>
        {userSource === CustomUserSource.System && <div>系统默认菜单一般为预设，如果非必须个人尽量不要去调整</div>}
      </div>

      <div className="px-3">
        <Button size="sm" onClick={handleSubmit} disabled={addIng}>
          <Save className="mr-2 h-4 w-4" />
          {addIng ? '保存中...' : '保存菜单'}
        </Button>
      </div>

      <div className="px-3 mt-3">
        <Separator />
      </div>

      {/* 相关错误 */}
      <div className="px-3 space-y-2 mt-3">
        {textbooksErr && <SimpleAlert title="菜单获取失败" message={textbooksErr.message} />}
        {customListRespErr && <SimpleAlert title="个性化配置信息获取失败" message={customListRespErr.message} />}
        {addErr}
      </div>

      {/* 相关加载中 */}
      {showLoading && <Loading />}

      <div className="p-3 space-y-2 bg-card">
        <ChapterExpandNav
          textbooks={textbooks}
          defaultValues={questionSearch.fiveLevelSelectKeys}
          onSelectionChange={(selectedTextbooks) => {
            const isEmpty = Object.values(selectedTextbooks).every((item) => item === null);
            if (isEmpty) return;

            // 收集选中的默认层级 key
            let selectedKeys: string[] = [];
            if (selectedTextbooks.first) {
              selectedKeys.push(selectedTextbooks.first.key);
            }
            if (selectedTextbooks.second) {
              selectedKeys.push(selectedTextbooks.second.key);
            }
            if (selectedTextbooks.third) {
              selectedKeys.push(selectedTextbooks.third.key);
            }
            if (selectedTextbooks.fourth) {
              selectedKeys.push(selectedTextbooks.fourth.key);
            }

            if (!selectedTextbooks || !selectedTextbooks.fifth) {
              updateQuestionSearch('fiveLevelId', 0);
              updateTextbook({ fifth: 0 });
            } else {
              const current: TextbookResp = selectedTextbooks.fifth;
              selectedKeys.push(current.key);
              updateQuestionSearch('fiveLevelId', current.id);
              updateTextbook({ fifth: current.id });
            }

            // 选中多少层就收集多少层
            updateQuestionSearch('fiveLevelSelectKeys', selectedKeys);
            updateTextbook({ fifthKeys: selectedKeys });
          }}
        />
      </div>
    </div>
  );
}
