import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigation } from "./NavigationProvider";
import { LoadingScreen } from "../../pages/LoadingScreen";
import type { Page } from "./types";

const pageVariants = {
  enter: {
    x: "100%",
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: "-100%",
    opacity: 0,
  },
};

const pageTransition = {
  type: "tween" as const,
  duration: 0.3,
};

export function PageContainer() {
  const { state, groups } = useNavigation();
  const initialPageRef = useRef<string | null>(null);
  const isInitialPage = initialPageRef.current === null;

  useEffect(() => {
    initialPageRef.current = state.currentPage;
  }, [state.currentPage]);

  // Track if this is the first page being rendered
  if (!state.currentGroup || !state.currentPage) {
    return null;
  }

  const group = groups.get(state.currentGroup);
  if (!group) {
    return null;
  }
  const currentPageIndex = group.pages.findIndex((p: Page) => p.id === state.currentPage);
  const currentPage = group.pages[currentPageIndex];
  if (!currentPage) {
    return null;
  }

  // Determine what to render based on loading state
  const renderContent = () => {
    if (state.isLoading) {
      return (
        <motion.div
          key="loading"
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
          className="absolute inset-0">
          <LoadingScreen />
        </motion.div>
      );
    }

    // For initial page, render without motion animation
    if (isInitialPage) {
      return (
        <motion.div
          variants={pageVariants}
          initial={false}
          animate="center"
          exit="exit"
          key={state.currentPage}
          transition={pageTransition}
          className="absolute inset-0">
          <currentPage.component />
        </motion.div>
      );
    }

    // For subsequent pages, use full animation
    return (
      <motion.div
        key={state.currentPage}
        variants={pageVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={pageTransition}
        className="absolute inset-0">
        <currentPage.component />
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}
