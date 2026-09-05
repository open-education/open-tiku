import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination';

// 简单的分页组件
interface PaginationProps {
  pageNo: number;
  pageSize: number;
  total: number;
  onPageChange: (value: number) => void; // 父组件处理数据请求
}

export function SimplePagination({ pageNo, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  // 生成页码列表（包含省略号）
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5; // 最多显示5个页码

    if (totalPages <= maxVisible) {
      // 如果总页数少，全部显示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 始终显示第一页
      pages.push(1);

      // 计算中间范围
      let start = Math.max(2, pageNo - 1);
      let end = Math.min(totalPages - 1, pageNo + 1);

      // 如果当前页靠近开头，扩展右边界
      if (pageNo <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      // 如果当前页靠近末尾，扩展左边界
      if (pageNo >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }

      // 左侧省略号
      if (start > 2) {
        pages.push('ellipsis');
      }

      // 中间页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 右侧省略号
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }

      // 始终显示最后一页
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // 处理上一页/下一页
  const handlePrev = () => {
    if (pageNo > 1) onPageChange(pageNo - 1);
  };
  const handleNext = () => {
    if (pageNo < totalPages) onPageChange(pageNo + 1);
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* 上一页 */}
        <PaginationItem>
          <PaginationPrevious onClick={handlePrev} aria-disabled={pageNo === 1} className={pageNo === 1 ? 'pointer-events-none opacity-50' : ''} />
        </PaginationItem>

        {/* 页码列表 */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink isActive={page === pageNo} onClick={() => onPageChange(page)}>
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* 下一页 */}
        <PaginationItem>
          <PaginationNext
            onClick={handleNext}
            aria-disabled={pageNo === totalPages}
            className={pageNo === totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
