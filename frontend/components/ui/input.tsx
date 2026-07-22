import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/* Resend inputs: black fill, 1px graphite hairline, 6px radius */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-input border px-4 py-3 text-body-sm font-body",
        "bg-black border-graphite-hairline text-white placeholder:text-charcoal",
        "transition-colors duration-150 ease-out focus:outline-none focus:border-white",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
