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
    y: 0,
    transition: {
      type: "tween" as const,
      duration: 0.3,
    },
  },
};

type OverlaySheetProps = {
  open: boolean;
  children?: React.ReactNode;
};

export function OverlaySheet({ open, children }: OverlaySheetProps) {
  return (
    <motion.div
      animate={open ? "open" : "closed"}
      variants={sheetVariants}
      initial="closed"
      className={`absolute inset-0 bg-background border-t-2 border-border flex flex-col ${
        open ? "z-40" : "z-10"
      }`}>
      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.div>
  );
}
