"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = (): [number, number] =>
    isMobile ? [0.85, 0.96] : [0.94, 1];

  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div
      className="h-[140vh] md:h-[160vh] flex items-start justify-center relative"
      ref={containerRef}
    >
      <div className="sticky top-[8vh] md:top-[10vh] w-full max-w-[1000px] mx-auto px-5 md:px-8">
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-3xl mx-auto text-center mb-10"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 40px rgba(0,53,102,0.15), 0 9px 20px rgba(0,0,0,0.08), 0 40px 80px rgba(0,53,102,0.1)",
        transformPerspective: 1200,
      }}
      className="max-w-[1000px] mx-auto w-full border-2 border-border p-1.5 md:p-2 rounded-[24px]"
    >
      <div
        className="h-full w-full overflow-hidden rounded-[18px] min-h-[420px] md:min-h-[460px]"
        style={{ backgroundColor: "#141E3D" }}
      >
        {children}
      </div>
    </motion.div>
  );
};
