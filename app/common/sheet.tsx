import type React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

/// Sheet 样式统一管理

interface SimpleSheetProps {
  openSheet: boolean;
  setOpenSheet: (value: boolean) => void;
  sheetTitle: string;
  sheetDesc: string;
  sheetContent: React.ReactNode;
}
function SimpleSheet({ openSheet, setOpenSheet, sheetTitle, sheetDesc, sheetContent }: SimpleSheetProps) {
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className="w-[90vw]! max-w-[90vw]! sm:w-[70vw]! md:w-[80vw]! lg:w-[90vw]! overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
          {sheetDesc && <SheetDescription>{sheetDesc}</SheetDescription>}
        </SheetHeader>
        {sheetContent}
      </SheetContent>
    </Sheet>
  );
}

export { SimpleSheet };
