import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/* DESIGN.MD Email Input Field spec:
   Fill #fff. Border 1px solid bone. Radius 16px. Padding 14px 20px.
   Placeholder ash. Focus ring: primary 2px outline, 4px offset. */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-2xl border border-bone bg-white text-ink text-[16px] font-body",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4",
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        "placeholder:text-ash",
        className
      )}
      style={{ padding: "14px 20px" }}
      {...props}
    />
  )
);
Input.displayName = "Input";
