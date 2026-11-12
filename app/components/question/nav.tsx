import { ChapterExpandNav, ChapterTreeCheckboxNav, type CheckboxTreeNode, type LevelProps } from '@/components/common/nav';
import { MultiTagSelect, TypeSelect } from '@/components/question/tag';
import type { QuestionSearch } from '@/type/question';
import type { OtherDictListRecord, TextbookResp } from '@/type/textbook';

// 题目搜索条件树
interface NavTreeListProps {
  textbooks: TextbookResp[];
  questionCates: CheckboxTreeNode[];
  onTextbook: (selection: LevelProps, selectedTextbooks: Record<keyof LevelProps, TextbookResp | null>) => void;
  onQuestionCate: (selectedItems: CheckboxTreeNode[]) => void;
}
function NavTreeList({ textbooks, questionCates, onTextbook, onQuestionCate }: NavTreeListProps) {
  return (
    <>
      <div className="p-3 space-y-2 bg-card">
        <ChapterExpandNav textbooks={textbooks} onSelectionChange={onTextbook} />

        <ChapterTreeCheckboxNav textbooks={questionCates} onSelect={onQuestionCate} maxDepth={3} />
      </div>
    </>
  );
}

// 搜索条件
interface SearchListProps {
  otherDictListRecord: OtherDictListRecord;
  questionSearch: QuestionSearch;
  updateQuestionSearch: (key: keyof QuestionSearch, value: number | number[] | string[]) => void;
}
function SearchList({ otherDictListRecord, questionSearch, updateQuestionSearch }: SearchListProps) {
  return (
    <div className="p-3 space-y-3 text-sm bg-card">
      {/* 分层体系 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">分层体系:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionLevels}
            value={questionSearch.levelIds}
            onChange={(val) => {
              updateQuestionSearch('levelIds', val);
            }}
          />
        </div>
      </div>

      {/* 类型 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">题目类型:</div>
        <div className="flex-1 min-w-0">
          <TypeSelect
            options={otherDictListRecord.questionTypes}
            value={questionSearch.typeId}
            onSelect={(val) => {
              updateQuestionSearch('typeId', val);
            }}
          />
        </div>
      </div>

      {/* 核心素养 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">核心素养:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionDimensions}
            value={questionSearch.dimensionIds}
            onChange={(val) => {
              updateQuestionSearch('dimensionIds', val);
            }}
          />
        </div>
      </div>

      {/* 适用场景 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">适用场景:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionScenes}
            value={questionSearch.sceneIds}
            onChange={(val) => {
              updateQuestionSearch('sceneIds', val);
            }}
          />
        </div>
      </div>

      {/* 标签 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">题目标签:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionTags}
            value={questionSearch.tagIds}
            onChange={(val) => {
              updateQuestionSearch('tagIds', val);
            }}
          />
        </div>
      </div>

      {/* 常见错误 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">常见错误:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionMistakeTips}
            value={questionSearch.mistakeTipIds}
            onChange={(val) => {
              updateQuestionSearch('mistakeTipIds', val);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { NavTreeList, SearchList };
