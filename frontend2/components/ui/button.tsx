import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "text";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-mono text-sm tracking-wide uppercase",
          "px-7 py-3 transition-all duration-300 whitespace-nowrap border",
          variant === "primary" &&
            "bg-primary text-primary-foreground border-primary font-bold hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(0,212,200,0.25)]",
          variant === "ghost" &&
            "bg-transparent text-foreground border-border hover:border-primary hover:text-primary",
          variant === "text" &&
            "bg-transparent text-muted-foreground border-none p-0 hover:text-primary",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
