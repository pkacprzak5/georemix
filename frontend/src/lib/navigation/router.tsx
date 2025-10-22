import { AnimatePresence, motion, type Transition, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import { useNavigation } from "./navigation-provider";
import type { Page } from "../../types/navigation";
import EdgeStars from "@/components/stars/edge-stars";

const pageVariants: Variants = {
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

const pageTransition: Transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.5,
};

export function Router() {
  const { state, modules: groups } = useNavigation();

  const initialPageRef = useRef<string | null>(null);
  const isInitialPage = initialPageRef.current === null;

  useEffect(() => {
    initialPageRef.current = state.currentPage;
  }, [state.currentPage]);

  // Track if this is the first page being rendered
  if (!state.currentModule || !state.currentPage) {
    return null;
  }

  const group = groups.get(state.currentModule);
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
    const pageContent = <currentPage.component />;

    // Wrap with EdgeStars if enabled for this page
    const contentWithStars = currentPage.showStars ? (
      <div className="flex h-full w-full min-h-full min-w-full">
        {/* Left edge stars */}
        <EdgeStars
          paddingLeft={20}
          className="4xl:w-[22.5%] 3xl:w-[25%] 2xl:w-[27.5%] xl:w-[25%] lg:flex hidden h-full"
        />

        {/* Main content */}
        <div className="flex-1 4xl:w-[55%] 3xl:w-[50%] 2xl:w-[45%] xl:w-[50%] lg:w-[60%] w-[60%]">
          {pageContent}
        </div>

        {/* Right edge stars */}
        <EdgeStars
          paddingRight={20}
          className="4xl:w-[22.5%] 3xl:w-[25%] 2xl:w-[27.5%] xl:w-[20%] lg:flex hidden h-full"
          reverse
        />
      </div>
    ) : (
      pageContent
    );

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
          {contentWithStars}
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
        {contentWithStars}
      </motion.div>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
    </div>
  );
}
