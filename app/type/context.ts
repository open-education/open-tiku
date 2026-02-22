import type { Textbook } from "~/type/textbook";

export interface TiKuIndexContext {
  pathMap: Map<string, Textbook[]>;
}
