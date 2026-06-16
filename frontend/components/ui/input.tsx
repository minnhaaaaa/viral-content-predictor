import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full rounded-lg border border-border bg-muted px-4 py-3 text-sm font-body text-foreground",
          "placeholder:text-border/80",
          "transition-colors duration-200 focus:outline-none focus:border-primary focus:bg-card",
          // Remove number input spinner arrows (Chrome, Safari, Edge)
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
