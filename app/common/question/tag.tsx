import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QuestionPageSource } from '@/type/enum';
import type { QuestionBaseInfoResp } from '@/type/question';
import type { OtherDictListRecord, TextbookOtherDictResp } from '@/type/textbook';
import { DictUtil } from '@/util/object';
import { StringConst } from '@/util/string';

interface MultiTagSelectProps {
  /** 标签数据列表 */
  options: TextbookOtherDictResp[];
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
          <Button key={option.id} type="button" variant={isSelected ? 'default' : 'outline'} onClick={() => handleToggle(option.id)}>
            {option.itemValue}
          </Button>
        );
      })}
    </div>
  );
}

interface TypeSelectProps {
  /** 标签选项数组 */
  options: TextbookOtherDictResp[];
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
        <Button key={option.id} variant={value === option.id ? 'default' : 'outline'} onClick={() => handleSelect(option.id)}>
          {option.itemValue}
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
// 分层体系
// 适用场景
// 常见错误
interface TagShowProps {
  pageSource: QuestionPageSource;
  questionInfo: QuestionBaseInfoResp;
  otherDictListRecord: OtherDictListRecord;
}

// 顶部标签显示
function TagTopShow({ questionInfo, otherDictListRecord }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    // 分层体系
    let levelName = DictUtil.getItemValue(questionInfo.levelId || 0, otherDictListRecord.questionLevelDict);
    const levelNode = levelName ? (
      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" key={levelName}>
        {levelName}
      </Badge>
    ) : (
      ''
    );

    // 题目类型
    let typeValue = DictUtil.getItemValue(questionInfo.questionTypeId, otherDictListRecord.questionTypeDict);
    const typeNode: React.ReactNode = (
      <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" key={questionInfo.questionTypeId}>
        {typeValue}
      </Badge>
    );

    // 题目标签
    let tagNames = DictUtil.getItemValues(questionInfo.questionTagIds || [], otherDictListRecord.questionTagDict);
    const tagNode = tagNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" key={val}>
          {val}
        </Badge>
      );
    });

    // 难度
    let difficultyLevelValue = questionInfo.difficultyLevel;
    const difficultyNode = difficultyLevelValue ? (
      <Badge className="bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300" key={difficultyLevelValue}>
        {difficultyLevelValue}
      </Badge>
    ) : (
      ''
    );

    return (
      <>
        {levelNode}
        {typeNode}
        {tagNode}
        {difficultyNode}
      </>
    );
  };

  return <>{getBadges()}</>;
}

// 底部标签显示
function TagBottomShow({ pageSource, questionInfo, otherDictListRecord }: TagShowProps) {
  // 生成标签列表
  const getBadges = () => {
    // 核心素养
    let dimensionNames = DictUtil.getItemValues(questionInfo.questionDimensionIds || [], otherDictListRecord.questionDimensionDict);
    const dimensionNode = dimensionNames.map((val) => {
      return (
        <Badge className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300" key={val}>
          {val}
        </Badge>
      );
    });

    // 适合场景
    let sceneNames = DictUtil.getItemValues(questionInfo.sceneIds || [], otherDictListRecord.questionSceneDict);
    const sceneNode = sceneNames.map((val) => {
      return (
        <Badge className="bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" key={val}>
          {val}
        </Badge>
      );
    });

    // 常见错误
    let mistakeTipNames = DictUtil.getItemValues(questionInfo.mistakeTipIds || [], otherDictListRecord.questionMistakeTipDict);
    const mistakeTipNode = mistakeTipNames.map((val) => {
      return (
        <Badge className="bg-green-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" key={val}>
          {val}
        </Badge>
      );
    });

    // 我的审核和题目需要展示题目状态
    const statusDesc =
      pageSource.source !== 'list' ? (
        <Badge className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" key={questionInfo.status}>
          {StringConst.questionStatusList[questionInfo.status].label || '草稿中'}
        </Badge>
      ) : (
        ''
      );

    return (
      <>
        {dimensionNode}
        {sceneNode}
        {mistakeTipNode}
        {statusDesc}
      </>
    );
  };

  return <>{getBadges()}</>;
}

export { MultiTagSelect, TagBottomShow, TagTopShow, TypeSelect };
