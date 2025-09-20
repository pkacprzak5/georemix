import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { type LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "./button";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends Omit<React.ComponentProps<"button">, "children">,
    VariantProps<typeof buttonVariants> {
  icon: LucideIcon;
  iconSize?: number;
  asChild?: boolean;
}

function IconButton({
  className,
  variant,
  size = "icon",
  icon: Icon,
  iconSize = 16,
  asChild = false,
  ...props
}: IconButtonProps) {
  return (
    <Button
      className={cn("aspect-square", className)}
      variant={variant}
      size={size}
      asChild={asChild}
      {...props}>
      <Icon size={iconSize} />
    </Button>
  );
}

export { IconButton };
