import type React from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { StringValidator } from "~/util/string";

/// Sheet 样式统一管理

interface SimpleSheetProps {
  openSheet: boolean;
  setOpenSheet: (value: boolean) => void;
  sheetTitle: React.ReactNode;
  sheetDesc: React.ReactNode;
  sheetContent: React.ReactNode;
}
function SimpleSheet({ openSheet, setOpenSheet, sheetTitle, sheetDesc, sheetContent }: SimpleSheetProps) {
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetContent className="w-[80vw]! max-w-[80vw]! sm:w-[70vw]! md:w-[80vw]! lg:w-[80vw]! overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{sheetTitle}</SheetTitle>
          {StringValidator.isNonEmpty(sheetDesc) && <SheetDescription>{sheetDesc}</SheetDescription>}
        </SheetHeader>
        {sheetContent}
      </SheetContent>
    </Sheet>
  );
}

export { SimpleSheet };
