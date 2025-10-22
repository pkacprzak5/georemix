import type { PropsWithChildren } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { modulesMap } from "./modules";
import type { Module, ModuleId, PageId } from "../../types/navigation";

export type NavigationAction =
  | { type: "SHOW_MENU" }
  | { type: "HIDE_MENU" }
  | { type: "NAVIGATE"; groupId: ModuleId; pageId: PageId }
  | {
      type: "NAVIGATE_WITH_LOADING";
      groupId: ModuleId;
      pageId: PageId;
      promise: Promise<unknown>;
      targetGroupId: ModuleId;
      targetPageId: PageId;
    };

export type NavigationState = {
  currentModule: ModuleId | null;
  currentPage: PageId | null;
  loadingData?: {
    promise: Promise<unknown>;
    targetModuleId: ModuleId;
    targetPageId: PageId;
  };
};

const initialState: NavigationState = {
  currentModule: null,
  currentPage: null,
};

export type NavigationContextType = {
  state: NavigationState;
  navigateTo: (groupId: ModuleId, pageId: PageId) => void;
  navigateWithLoading: (
    targetGroupId: ModuleId,
    targetPageId: PageId,
    promise: Promise<unknown>
  ) => void;
  navigateToNewGroup: (groupId: ModuleId) => void;
  modules: Map<ModuleId, Module>;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case "NAVIGATE":
      return {
        ...state,
        currentModule: action.groupId,
        currentPage: action.pageId,
        loadingData: undefined,
      };
    case "NAVIGATE_WITH_LOADING":
      return {
        ...state,
        currentModule: action.groupId,
        currentPage: action.pageId,
        loadingData: {
          promise: action.promise,
          targetModuleId: action.targetGroupId,
          targetPageId: action.targetPageId,
        },
      };
    default:
      return state;
  }
}

export function NavigationProvider({ children }: PropsWithChildren) {
  const [navigationState, navigationStateDispatch] = useReducer(navigationReducer, initialState);

  const modules = useRef<Map<ModuleId, Module>>(new Map());
  const initialNavigationDone = useRef<boolean>(false);

  const mountModule = useCallback(
    (module: Module) => {
      const isAlreadyRegistered = modules.current.has(module.id);

      // TODO:  This logic and it's point a bit vague. Can't we just
      //        hard-code what's the first page, instead of doing all of this?

      // It stayed here for ore than 5 minutes so it can stay for good at this point. ~Paweł
      modules.current.set(module.id, module);

      if (
        !isAlreadyRegistered &&
        !initialNavigationDone.current &&
        !navigationState.currentModule
      ) {
        const initialPage = module.initialPage || module.pages[0]?.id;

        if (initialPage) {
          initialNavigationDone.current = true;
          navigationStateDispatch({ type: "NAVIGATE", groupId: module.id, pageId: initialPage });
        }
      }
    },
    [navigationState.currentModule]
  );

  useEffect(() => {
    for (const module of Object.values(modulesMap)) {
      mountModule(module);
    }
  }, [mountModule]);

  const navigateTo = useCallback((groupId: ModuleId, pageId: PageId) => {
    navigationStateDispatch({ type: "NAVIGATE", groupId, pageId });
  }, []);

  const navigateWithLoading = useCallback(
    (targetGroupId: ModuleId, targetPageId: PageId, promise: Promise<unknown>) => {
      navigationStateDispatch({
        type: "NAVIGATE_WITH_LOADING",
        groupId: "LOADING",
        pageId: "navigation-loading",
        promise,
        targetGroupId,
        targetPageId,
      });
    },
    []
  );

  const navigateToNewGroup = useCallback((groupId: ModuleId) => {
    const group = modules.current.get(groupId);

    if (group) {
      const initialPage = group.initialPage || group.pages[0]?.id;

      if (initialPage) {
        navigationStateDispatch({ type: "NAVIGATE", groupId, pageId: initialPage });
      }
    }
  }, []);

  const contextValue = useMemo<NavigationContextType>(
    () => ({
      state: navigationState,
      navigateTo,
      navigateWithLoading,
      navigateToNewGroup,
      modules: modules.current,
    }),
    [navigationState, navigateTo, navigateWithLoading]
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);

  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }

  return context;
}
