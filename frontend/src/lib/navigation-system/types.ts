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
  | { type: 'SHOW_MENU' }
  | { type: 'HIDE_MENU' }
  | { type: 'NAVIGATE'; groupId: GroupId; pageId: PageId }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'NAVIGATE_WITH_LOADING'; groupId: GroupId; pageId: PageId; promise: Promise<unknown> };

export interface NavigationContextType {
  state: NavigationState;
  navigateTo: (groupId: GroupId, pageId: PageId) => void;
  navigateWithLoading: (groupId: GroupId, pageId: PageId, promise: Promise<unknown>) => void;
  showMenu: () => void;
  hideMenu: () => void;
  navigateToNewGroup: (groupId: GroupId) => void;
  groups: Map<GroupId, Group>;
}

export enum GroupName {
  WELCOME = "welcome",
  MAIN_MENU = "main_menu",
  LEVEL_START = "level_start",
  LEVEL_END = "level_end",
  GAME_END = "game_end",
}