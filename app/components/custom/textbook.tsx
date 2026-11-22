import { SimpleAlert } from '@/components/common/alert';
import { Loading } from '@/components/common/load';
import { ChapterExpandNav } from '@/components/common/nav';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDelayedLoading } from '@/hooks/delayed-loading';
import type { CustomAddReq, CustomTextbook } from '@/type/custom';
import { CustomModeType, CustomPageSource, CustomType, CustomUserSource } from '@/type/enum';
import type { TextbookFillLevel } from '@/type/textbook';
import { useCustomList, useTextbooks } from '@/util/fetcher';
import { httpClient } from '@/util/http';
import { Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// 教材层级配置

interface TextbookProps {
  userSource: CustomUserSource;
  pageSource: CustomPageSource;
}

export default function TextbookList({ userSource, pageSource }: TextbookProps) {
  // 网站主要导航
  const { data: textbooks = [], isLoading: textbooksIsLoading, error: textbooksErr } = useTextbooks();

  const [fillLevel, setFillLevel] = useState<TextbookFillLevel>({ fiveLevelKeys: [], eightLevelKeys: [] });
  const updateFillLevel = (key: keyof TextbookFillLevel, value: string[]) => {
    setFillLevel((prev) => ({ ...prev, [key]: value }));
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
      if (customTextbook.textbook.keys && customTextbook.textbook.keys.length > 0) {
        updateFillLevel('fiveLevelKeys', customTextbook.textbook.keys);
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
          onClick: () => {},
        },
      });
      return;
    }
    // 前5层级至少选择到第二层
    if (!addReq.textbook.keys || addReq.textbook.keys.length < 2) {
      toast.error(<div className="text-red-700">前5层级最少需要选择到第二层科目</div>, {
        duration: Infinity,
        action: {
          label: '关闭',
          onClick: () => {},
        },
      });
      return;
    }

    setAddIng(true);
    setAddErr(null);

    httpClient
      .post('/custom/add', addReq)
      .then((_) => {
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
          defaultValues={fillLevel.fiveLevelKeys}
          onSelectionChange={(selectedTextbooks) => {
            const isEmpty = Object.values(selectedTextbooks).every((item) => item === null);
            if (isEmpty) return;
            const keys: string[] = selectedTextbooks.map((item) => item.key);
            const idFullPath = selectedTextbooks.length > 0 ? `/${selectedTextbooks.map((item) => item.id).join('/')}/` : '';

            let mode = CustomModeType.Chapter;
            if (selectedTextbooks.length > 2) {
              if (selectedTextbooks[selectedTextbooks.length - 1].pathType === 'knowledge') {
                mode = CustomModeType.Knowledge;
              }
            }

            updateAddReq('textbook', { mode, path: idFullPath, keys });
          }}
        />
      </div>
    </div>
  );
}
