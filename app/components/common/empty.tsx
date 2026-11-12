import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Trash } from 'lucide-react';

/// 空的提示信息

interface SimpleNoDataProps {
  desc: string;
}
function SimpleNoData({ desc }: SimpleNoDataProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trash />
        </EmptyMedia>
        <EmptyTitle className="text-base">暂无数据</EmptyTitle>
        <EmptyDescription>{desc}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { SimpleNoData };
