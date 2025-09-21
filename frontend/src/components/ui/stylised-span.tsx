import { type ReactNode } from "react";
import Star9 from "./stars/Star9";

interface Props {
  children: ReactNode;
  showStars?: boolean;
}

const StylisedSpan = ({ children, showStars }: Props) => {
  return (
    <span className="relative px-2 sm:mr-2 mr-0 md:[&_svg]:size-[45px] sm:[&_svg]:size-7 bg-main/50 rounded-base border-2 border-border/40 dark:border-border/70">
      {children}
      {showStars && (
        <>
          <Star9
            className="absolute sm:block hidden md:-bottom-4 md:-right-5 -bottom-2.5 -right-2.5"
            color="var(--main)"
            pathClassName="stroke-5 dark:stroke-3.5 stroke-black dark:stroke-black/70"
          />
          <Star9
            className="absolute sm:block hidden md:-top-4 md:-left-5 -top-2.5 -left-2.5"
            color="var(--main)"
            pathClassName="stroke-5 dark:stroke-3.5 stroke-black dark:stroke-black/70"
          />
        </>
      )}
    </span>
  );
};

export default StylisedSpan;
