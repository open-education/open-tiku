import { MultiTagSelect, TypeSelect } from '@/components/question/tag';
import type { QuestionListReq } from '@/type/question';
import type { OtherDictListRecord } from '@/type/textbook';

// 搜索条件
interface SearchListProps {
  otherDictListRecord: OtherDictListRecord;
  listReq: QuestionListReq;
  updateListReq: (key: keyof QuestionListReq, value: number | number[] | string) => void;
}
function SearchList({ otherDictListRecord, listReq, updateListReq }: SearchListProps) {
  return (
    <div className="p-3 space-y-3 text-sm bg-card">
      {/* 分层体系 */}
      <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
        <div className="md:w-24 shrink-0 font-medium">分层体系:</div>
        <div className="flex-1 min-w-0">
          <MultiTagSelect
            options={otherDictListRecord.questionLevels}
            value={listReq.levelIds || []}
            onChange={(val) => {
              updateListReq('levelIds', val);
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
            value={listReq.questionTypeId}
            onSelect={(val) => {
              updateListReq('questionTypeId', val);
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
            value={listReq.dimensionIds || []}
            onChange={(val) => {
              updateListReq('dimensionIds', val);
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
            value={listReq.sceneIds || []}
            onChange={(val) => {
              updateListReq('sceneIds', val);
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
            value={listReq.tagIds || []}
            onChange={(val) => {
              updateListReq('tagIds', val);
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
            value={listReq.mistakeTipIds || []}
            onChange={(val) => {
              updateListReq('mistakeTipIds', val);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export { SearchList };
