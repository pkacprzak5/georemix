import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrutalistInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  className?: string;
  label?: string;
  ref?: React.RefObject<HTMLInputElement | null>;
  disabled?: boolean;
}

export const InputButton = ({
  placeholder = "ENTER NAME",
  value,
  onChange,
  onSubmit,
  className = "",
  label,
  ref,
  disabled = false,
}: BrutalistInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && onSubmit && value.trim() && !disabled) {
      onSubmit();
    }
  };

  const handleSubmit = () => {
    if (onSubmit && value.trim() && !disabled) {
      onSubmit();
    }
  };

  const isDisabled = !value.trim() || disabled;

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label className="block text-xs font-base uppercase tracking-wider mb-2 text-foreground">
          {label}
        </label>
      )}
      <div className="relative hover:-translate-y-1 hover:shadow-highlight flex rounded-base border-2 border-border bg-secondary-background shadow-shadow transition-all [&:has(button:hover)]:translate-x-boxShadowX [&:has(button:hover)]:translate-y-boxShadowY [&:has(button:hover)]:shadow-none">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-6 py-4 text-lg font-base bg-transparent border-none outline-none placeholder:text-foreground/50 text-foreground rounded-l-base "
        />
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={cn(
            "px-6 py-4 bg-main text-main-foreground border-l-2 border-border transition-all duration-150 flex items-center justify-center rounded-r-base",
            "hover:bg-main/90",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          type="button">
          <ArrowRight className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

InputButton.displayName = "BrutalistInput";
