"use client";

import * as React from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  id: string;
  label: string;
}

function useClickAway(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

interface FluidDropdownProps {
  options: DropdownOption[];
  placeholder: string;
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

export function FluidDropdown({
  options,
  placeholder,
  value,
  onChange,
  className,
}: FluidDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const handleClickAway = React.useCallback(() => setIsOpen(false), []);
  useClickAway(dropdownRef as React.RefObject<HTMLElement>, handleClickAway);

  const selectedOption = options.find((o) => o.id === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("relative w-full", className)} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg border border-border bg-muted px-4 py-3",
            "text-sm font-body text-foreground/90",
            "transition-colors duration-200",
            "hover:border-primary/60",
            isOpen && "border-primary bg-card rounded-b-none"
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className={cn(!selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center w-4 h-4 text-muted-foreground flex-shrink-0"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 1, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: { type: "spring", stiffness: 500, damping: 32, mass: 1 },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: { type: "spring", stiffness: 500, damping: 32, mass: 1 },
              }}
              className="absolute left-0 right-0 top-full z-50 overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              <motion.div
                className="w-full rounded-b-lg border border-t-0 border-primary bg-card p-1 shadow-lg"
                style={{ transformOrigin: "top" }}
              >
                <motion.div
                  className="py-1.5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {options.map((option) => (
                    <motion.button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                      }}
                      onHoverStart={() => setHovered(option.id)}
                      onHoverEnd={() => setHovered(null)}
                      className={cn(
                        "relative flex w-full items-center rounded-md px-4 py-2.5 text-sm font-body text-left",
                        "transition-colors duration-150 focus:outline-none",
                        value === option.id || hovered === option.id
                          ? "text-foreground bg-white/[0.06]"
                          : "text-muted-foreground"
                      )}
                      whileTap={{ scale: 0.98 }}
                      variants={itemVariants}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
