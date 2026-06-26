'use client';
import { type JSX, useEffect, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';

type TextTypewriterProps = {
  children: string;
  speed?: number;
  startDelay?: number;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  cursor?: boolean;
  onTypeComplete?: () => void;
} & MotionProps;

export function TextTypewriter({
  children,
  speed = 0.035,
  startDelay = 0,
  className,
  as: Component = 'p',
  trigger = true,
  cursor = true,
  onTypeComplete,
  ...props
}: TextTypewriterProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements
  );
  const text = children;
  const [displayText, setDisplayText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    let charIndex = 0;
    let interval: ReturnType<typeof setInterval>;
    setDisplayText('');
    setIsDone(false);

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        charIndex++;
        setDisplayText(text.slice(0, charIndex));

        if (charIndex >= text.length) {
          clearInterval(interval);
          setIsDone(true);
          onTypeComplete?.();
        }
      }, speed * 1000);
    }, startDelay * 1000);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, text]);

  return (
    <MotionComponent className={className} {...props}>
      {displayText}
      {cursor && (
        <span
          aria-hidden="true"
          className={`inline-block w-[1px] h-[1em] -mb-[0.1em] ml-[2px] bg-current ${
            isDone ? 'animate-pulse' : 'opacity-100'
          }`}
        />
      )}
    </MotionComponent>
  );
}
