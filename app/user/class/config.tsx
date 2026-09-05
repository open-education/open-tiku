import { GradeSelect } from '~/common/paper/grade';
import { SemesterSelect } from '~/common/paper/semester';
import { YearSelect } from '~/common/paper/year';
import type { ClassSearchReq } from '~/type/class';
import { StringConst } from '~/util/string';

// 班级通用搜索

interface SearchConfigProps {
  searchReq: ClassSearchReq;
  updateSearchReq: (key: keyof ClassSearchReq, value: string) => void;
}

function SearchConfig({ searchReq, updateSearchReq }: SearchConfigProps) {
  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">年份:</div>
          <div className="flex-1 min-w-0">
            <YearSelect value={searchReq.year} onValueChange={(val) => updateSearchReq('year', val ?? '')} placeholder="选择年份" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">年级:</div>
          <div className="flex-1 min-w-0">
            <GradeSelect
              value={searchReq.grade}
              onValueChange={(val) => {
                if (!val || StringConst.searchCondDefaultVal === val) {
                  updateSearchReq('grade', '');
                } else {
                  updateSearchReq('grade', val);
                }
              }}
              placeholder="选择年级"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
          <div className="md:w-24 shrink-0 font-medium">学期:</div>
          <div className="flex-1 min-w-0">
            <SemesterSelect
              value={searchReq.semester}
              onValueChange={(val) => {
                if (!val || StringConst.searchCondDefaultVal === val) {
                  updateSearchReq('semester', '');
                } else {
                  updateSearchReq('semester', val);
                }
              }}
              placeholder="选择学期"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export { SearchConfig };
