import type React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

/// Sheet 样式统一管理

interface SimpleSheetProps {
  openSheet: boolean;
  setOpenSheet: (value: boolean) => void;
  sheetTitle: string;
  sheetDesc: string;
  sheetContent: React.ReactNode;
  className?: string;
}
function SimpleSheet({
  openSheet,
  setOpenSheet,
  sheetTitle,
  sheetDesc,
  sheetContent,
  className = "w-[90vw]! max-w-[90vw]! sm:w-[70vw]! md:w-[80vw]! lg:w-[90vw]! overflow-y-auto",
}: SimpleSheetProps) {
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className={className}>
        <SheetHeader>
          <SheetTitle className="text-base font-bold">{sheetTitle}</SheetTitle>
          {sheetDesc && <SheetDescription className="text-sm">{sheetDesc}</SheetDescription>}
        </SheetHeader>
        {sheetContent}
      </SheetContent>
    </Sheet>
  );
}

export { SimpleSheet };
