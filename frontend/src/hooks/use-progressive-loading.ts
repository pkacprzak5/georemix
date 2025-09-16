import { useState, useCallback } from "react";

interface UseProgressiveLoadingOptions {
  initialProgress?: number;
  baseDelayMs?: number;
  randomizationFactor?: number; // 0 to 1, where 1 means up to 100% randomization
}

interface ProgressiveLoadingResult {
  progress: number;
  executeWithProgress: (
    asyncOperation?: Promise<unknown>,
    onComplete?: () => void
  ) => Promise<void>;
  resetProgress: () => void;
}

/**
 * Hook for managing progressive loading with randomized timing
 * Progresses through 33% -> 66% -> 100% with configurable delays
 */
export function useProgressiveLoading({
  initialProgress = 33,
  baseDelayMs = 500,
  randomizationFactor = 0.3, // 30% randomization by default
}: UseProgressiveLoadingOptions = {}): ProgressiveLoadingResult {
  const [progress, setProgress] = useState(initialProgress);

  const getRandomizedDelay = useCallback((baseDelay: number): number => {
    const randomFactor = 1 + (Math.random() - 0.5) * 2 * randomizationFactor;
    return Math.floor(baseDelay * (1+randomFactor));
  }, [randomizationFactor]);

  const executeWithProgress = useCallback(async (
    asyncOperation?: Promise<unknown>,
    onComplete?: () => void
  ): Promise<void> => {
    try {
      // Wait for the async operation if provided
      if (asyncOperation) {
        await asyncOperation;
      }
      
      // Progress to 66%
      await new Promise(resolve => setTimeout(resolve, getRandomizedDelay(baseDelayMs)));
      setProgress(66);
      
      // Progress to 100%
      await new Promise(resolve => setTimeout(resolve, getRandomizedDelay(baseDelayMs)));
      setProgress(100);
      
      // Final delay before completion
      await new Promise(resolve => setTimeout(resolve, getRandomizedDelay(baseDelayMs * 1.6)));
      
      // Execute completion callback
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Progressive loading error:", error);
      // Still complete the loading process on error
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, getRandomizedDelay(baseDelayMs)));
      if (onComplete) {
        onComplete();
      }
    }
  }, [baseDelayMs, getRandomizedDelay]);

  const resetProgress = useCallback(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  return {
    progress,
    executeWithProgress,
    resetProgress,
  };
}