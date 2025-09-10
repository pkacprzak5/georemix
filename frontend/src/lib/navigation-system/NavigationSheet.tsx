import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from './NavigationProvider';
import { PageContainer } from './PageContainer';
import { Button } from '@/components/ui/button';

const sheetVariants = {
  closed: {
    y: '100%',
    transition: {
      type: 'tween' as const,
      duration: 0.3,
    },
  },
  open: {
    y: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.3,
    },
  },
};

export function NavigationSheet() {
  const { state, hideMenu } = useNavigation();
  const isInitialLoadRef = useRef(true);

  // Mark that initial load is complete after first render
  useEffect(() => {
    isInitialLoadRef.current = false;
  }, []);

  return (
    <>
      <motion.div
        animate={state.isMenuOpen ? "open" : "closed"}
        variants={sheetVariants}
        initial="false" // Always start in open position
        className={`absolute inset-0 bg-background border-t-2 border-border flex flex-col ${
          state.isMenuOpen ? 'z-40' : 'z-10'
        }`}
      >
        <div className="flex-1 overflow-hidden">
          <PageContainer />
        </div>
      </motion.div>
      {state.isMenuOpen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background z-50">
          <Button onClick={hideMenu} className="w-full">
            Hide Menu
          </Button>
        </div>
      )}
    </>
  );
}
