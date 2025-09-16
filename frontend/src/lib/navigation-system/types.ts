export type Page = {
  id: PageId;
  component: React.ComponentType;
  title?: string;
};

export type PageId = string;

export type Module = {
  id: ModuleId;
  pages: Page[];
  initialPage?: PageId;
};

export const moduleIdMap = {
  TITLE: "TITLE",
  INTRO: "INTRO",
  LEVEL_START: "LEVEL_START",
  GAMEPLAY: "GAMEPLAY" ,
  LEVEL_END: "LEVEL_END",
  FINAL: "FINAL",
  LOADING: "LOADING",
} as const;

export type ModuleId = (typeof moduleIdMap)[keyof typeof moduleIdMap];
