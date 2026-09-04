import { NotepadTextDashed } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '~/components/ui/empty';

/// 空的提示信息

interface SimpleNoDataProps {
  desc: string;
}
function SimpleNoData({ desc }: SimpleNoDataProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <NotepadTextDashed />
        </EmptyMedia>
        <EmptyTitle className="text-base">No Data</EmptyTitle>
        <EmptyDescription className="text-sm">{desc}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export { SimpleNoData };
