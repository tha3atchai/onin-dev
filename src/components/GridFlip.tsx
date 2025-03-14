"use client";

import { motion } from "motion/react";
import { useState } from "react";

const FlipCard = ({ columnIndex }: { columnIndex: number }) => {
  const [flipCount, setFlipCount] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const handleHover = () => {
    if (!isFlipping) {
      setIsFlipping(true);
      setFlipCount(prev => prev + 1);
    }
  };

  const handleAnimationComplete = () => {
    setIsFlipping(false);
  };

  let perspectiveOrigin = "50%";
  if (columnIndex === 4) {
    perspectiveOrigin = "0% -100%";
  } else if (columnIndex === 5) {
    perspectiveOrigin = "-200%";
  } else if (columnIndex === 6) {
    perspectiveOrigin = "-300%";
  } else if (columnIndex === 7) {
    perspectiveOrigin = "-400%";
  } else if (columnIndex === 3) {
    perspectiveOrigin = "100% 0%";
  } else if (columnIndex === 2) {
    perspectiveOrigin = "200%";
  } else if (columnIndex === 1) {
    perspectiveOrigin = "300%";
  } else if (columnIndex === 0) {
    perspectiveOrigin = "400%";
  }

  return (
    <div
      className="w-full h-full"
      onMouseEnter={handleHover}
      style={{
        perspective: "1200px",
        perspectiveOrigin,
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateX: [
            -360 * (flipCount - 1),
            -360 * flipCount - 20,
            -360 * flipCount,
          ],
        }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        onAnimationComplete={handleAnimationComplete}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-[#1b1c2096] backdrop-blur-sm text-white flex items-center justify-center rounded-sm"></div>
        {/* Back */}
        <div
          className="absolute inset-0 backface-hidden bg-red-800 text-white flex items-center justify-center rounded-sm"
          style={{ transform: "rotateY(180deg)" }}
        ></div>
      </motion.div>
    </div>
  );
};

export default function GridFlip() {
  const totalCards = 6 * 8;

  return (
    <div className="grid grid-cols-8 gap-[2px] w-full h-screen absolute z-20">
      {Array.from({ length: totalCards }).map((_, idx) => {
        const columnIndex = idx % 8;
        return (
          <div key={idx} className="w-full h-auto">
            <FlipCard columnIndex={columnIndex} />
          </div>
        );
      })}
    </div>
  );
}
