import { useEffect } from "react";
import { LoadingScreen } from "@/pages/loading-screen";
import { useNavigation } from "@/lib/navigation-system/navigation-provider";
import { useProgressiveLoading } from "@/hooks/use-progressive-loading";

// Loading page component that handles promise resolution and navigation
export function NavigationLoadingPage() {
  const { state, navigateTo } = useNavigation();
  const { progress, executeWithProgress } = useProgressiveLoading({
    initialProgress: 33,
    baseDelayMs: 300,
    randomizationFactor: 1, // 40% randomization for variety
  });

  useEffect(() => {
    const loadingData = state.loadingData;
    if (!loadingData) {
      return;
    }

    executeWithProgress(
      loadingData.promise,
      () => {
        navigateTo(loadingData.targetModuleId, loadingData.targetPageId);
      }
    );
  }, [state.loadingData, navigateTo, executeWithProgress]);

  return <LoadingScreen progress={progress} />;
}