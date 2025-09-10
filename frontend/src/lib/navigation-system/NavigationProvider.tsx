import { createContext, useContext, useReducer, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { NavigationState, NavigationAction, NavigationContextType, Group, GroupId, PageId } from './types';
import { GROUPS_MAP } from './groups';

const initialState: NavigationState = {
  isMenuOpen: true,
  currentGroup: null,
  currentPage: null,
  isLoading: false,
};

function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'SHOW_MENU':
      return { ...state, isMenuOpen: true };
    case 'HIDE_MENU':
      return { ...state, isMenuOpen: false };
    case 'NAVIGATE':
      return {
        ...state,
        currentGroup: action.groupId,
        currentPage: action.pageId,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'NAVIGATE_WITH_LOADING':
      return {
        ...state,
        currentGroup: action.groupId,
        currentPage: action.pageId,
        isLoading: true,
      };
    default:
      return state;
  }
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [state, dispatch] = useReducer(navigationReducer, initialState);
  const groups = useRef<Map<GroupId, Group>>(new Map());
  const initialNavigationDone = useRef<boolean>(false);

  // register groups internally from GROUPS_MAP
  const registerGroup = useCallback((group: Group) => {
    const isAlreadyRegistered = groups.current.has(group.id);
    groups.current.set(group.id, group);

    if (!isAlreadyRegistered && !initialNavigationDone.current && !state.currentGroup) {
      const initialPage = group.initialPage || group.pages[0]?.id;
      if (initialPage) {
        initialNavigationDone.current = true;
        dispatch({ type: 'NAVIGATE', groupId: group.id, pageId: initialPage });
      }
    }
  }, [state.currentGroup]);

  // On mount, register all groups from GROUPS_MAP
  useEffect(() => {
    for (const g of GROUPS_MAP.values()) {
      registerGroup(g);
    }
  }, [registerGroup]);

  const navigateTo = useCallback((groupId: GroupId, pageId: PageId) => {
    dispatch({ type: 'NAVIGATE', groupId, pageId });
  }, []);

  const navigateWithLoading = useCallback(async (groupId: GroupId, pageId: PageId, promise: Promise<unknown>) => {
    dispatch({ type: 'NAVIGATE_WITH_LOADING', groupId, pageId, promise });
    try {
      await promise;
    } finally {
      dispatch({ type: 'SET_LOADING', loading: false });
    }
  }, []);

  const navigateToNewGroup = useCallback((groupId: GroupId) => {
    const group = groups.current.get(groupId);
    if (group) {
      const initialPage = group.initialPage || group.pages[0]?.id;
      if (initialPage) {
        dispatch({ type: 'NAVIGATE', groupId, pageId: initialPage });
      }
    }
  }, []);

  const showMenu = useCallback(() => {
    dispatch({ type: 'SHOW_MENU' });
  }, []);

  const hideMenu = useCallback(() => {
    dispatch({ type: 'HIDE_MENU' });
  }, []);

  const contextValue = useMemo<NavigationContextType>(() => ({
    state,
    navigateTo,
    navigateWithLoading,
    showMenu,
    hideMenu,
    navigateToNewGroup,
    groups: groups.current,
  }), [state, navigateTo, navigateWithLoading, showMenu, hideMenu]);

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
