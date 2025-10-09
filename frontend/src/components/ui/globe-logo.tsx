// @ts-ignore
import Globe from "../../../public/globe.svg?react";
import Star9 from "./stars/Star9";

export function GlobeLogo() {
  return (
    <div className="relative inline-block w-full">
      {/* Top-left star */}
      <Star9
        size={90}
        color="white"
        className="absolute -top-2 -left-2 text-primary "
        pathClassName="stroke-5 dark:stroke-3.5 stroke-black dark:stroke-black/70"
      />

      {/* Globe */}
      <Globe width="100%" height="100%" />

      {/* Bottom-right star */}
      <Star9
        size={80}
        color="white"
        className="absolute -bottom-0.5 -right-0 text-accent"
        pathClassName="stroke-5 dark:stroke-3.5 stroke-black dark:stroke-black/70"
      />
    </div>
  );
}
