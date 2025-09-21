import { motion, type Variants } from "framer-motion";

const sheetVariants: Variants = {
  closed: {
    y: "100%",
    transition: {
      type: "tween" as const,
      duration: 0.3,
    },
  },
  open: {
    y: "0%",
    transition: {
      type: "tween" as const,
      duration: 0.3,
    },
  },
};

type OverlaySheetProps = {
  open: boolean;
  children?: React.ReactNode;
  skipInitialAnimation?: boolean;
  zIndex?: number;
};

export function OverlaySheet({ open, children, skipInitialAnimation = false }: OverlaySheetProps) {
  const getInitialState = () => {
    if (skipInitialAnimation && open) {
      return "open";
    }
    return "closed";
  };

  return (
    <motion.div
      animate={open ? "open" : "closed"}
      variants={sheetVariants}
      initial={getInitialState()}
      className={`absolute w-[105%] left-[-4%] inset-0 bg-background flex flex-col z-[1000]`}>
      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.div>
  );
}
