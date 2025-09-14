export type PageId = string;
export type GroupId = string;

export interface Page {
  id: PageId;
  component: React.ComponentType;
  title?: string;
}

export interface Group {
  id: GroupId;
  pages: Page[];
  initialPage?: PageId;
}

export interface NavigationState {
  isMenuOpen: boolean;
  currentGroup: GroupId | null;
  currentPage: PageId | null;
  isLoading: boolean;
}

export type NavigationAction =
  | { type: "SHOW_MENU" }
  | { type: "HIDE_MENU" }
  | { type: "NAVIGATE"; groupId: GroupId; pageId: PageId }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "NAVIGATE_WITH_LOADING"; groupId: GroupId; pageId: PageId; promise: Promise<unknown> };

export interface NavigationContextType {
  state: NavigationState;
  navigateTo: (groupId: GroupId, pageId: PageId) => void;
  navigateWithLoading: (groupId: GroupId, pageId: PageId, promise: Promise<unknown>) => void;
  showMenu: () => void;
  hideMenu: () => void;
  navigateToNewGroup: (groupId: GroupId) => void;
  groups: Map<GroupId, Group>;
}

export const groupNameMap = {
  TITLE: "TITLE",
  INIT_GROUP: "INIT_GROUP",
  MAIN_MENU: "MAIN_MENU",
  LEVEL_START: "LEVEL_START",
  LEVEL_END: "LEVEL_END",
  GAME_END: "GAME_END",
} as const;

export type GroupName = (typeof groupNameMap)[keyof typeof groupNameMap];
