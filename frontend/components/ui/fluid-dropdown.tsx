"use client";
import * as React from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownOption { id: string; label: string; }

function useClickAway(ref: React.RefObject<HTMLElement>, handler: (e: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const fn = (e: MouseEvent | TouchEvent) => { if (!ref.current || ref.current.contains(e.target as Node)) return; handler(e); };
    document.addEventListener("mousedown", fn);
    document.addEventListener("touchstart", fn);
    return () => { document.removeEventListener("mousedown", fn); document.removeEventListener("touchstart", fn); };
  }, [ref, handler]);
}

const itemVariants = {
  hidden:  { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] as any } },
};

export function FluidDropdown({ options, placeholder, value, onChange, className }: {
  options: DropdownOption[]; placeholder: string; value: string | null;
  onChange: (v: string) => void; className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hovered, setHovered] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);
  useClickAway(ref as React.RefObject<HTMLElement>, () => setIsOpen(false));
  const selected = options.find(o => o.id === value);

  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("relative w-full", className)} ref={ref}>
        <button type="button" onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between rounded-input border px-4 py-3",
            "text-body-sm font-body text-white transition-colors duration-150 ease-out",
            "bg-black border-graphite-hairline",
            isOpen && "border-white rounded-b-none"
          )}
          aria-expanded={isOpen}>
          <span className={cn(!selected && "text-charcoal")}>{selected ? selected.label : placeholder}</span>
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.15 }} className="w-4 h-4 text-charcoal flex-shrink-0">
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 1, height: 0 }} animate={{ opacity: 1, height: "auto", transition: { duration: 0.15, ease: "easeOut" } }}
              exit={{ opacity: 0, height: 0, transition: { duration: 0.15, ease: "easeOut" } }}
              className="absolute left-0 right-0 top-full z-50 overflow-hidden"
            >
              <div className="w-full rounded-b-input border border-t-0 border-white bg-black p-1">
                <motion.div className="py-1" initial="hidden" animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.03 } } }}>
                  {options.map(opt => (
                    <motion.button key={opt.id} type="button" variants={itemVariants}
                      onClick={() => { onChange(opt.id); setIsOpen(false); }}
                      onHoverStart={() => setHovered(opt.id)} onHoverEnd={() => setHovered(null)}
                      className={cn(
                        "flex w-full items-center rounded-[6px] px-4 py-2.5 text-body-sm font-body text-left transition-colors duration-150 focus:outline-none",
                        (value === opt.id || hovered === opt.id) ? "text-iris-violet" : "text-ash-gray"
                      )}
                      whileTap={{ scale: 0.98 }}>
                      {opt.label}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
