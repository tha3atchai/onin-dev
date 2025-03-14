"use client";
import React, { useEffect, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import * as THREE from "three";
import Lenis from "lenis";
import GridFlip from "@/components/GridFlip";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

const useLenis = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
};

const HeadScene = ({ mouse }: { mouse: { x: number; y: number } }) => {
  return (
    <div className="w-full h-full">
      <Canvas style={{ pointerEvents: "none" }}>
        <Environment preset="city" />
        <RotatingModel mouse={mouse} />
      </Canvas>
    </div>
  );
};

const RotatingModel = ({ mouse }: { mouse: { x: number; y: number } }) => {
  const modelRef = useRef<THREE.Group>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  const initialPosition = useRef<[number, number, number]>([-0.05, 0, -1]);
  const movedPosition = useRef<[number, number, number]>([0, 0.3, 0.1]);

  const initialScale = useRef<[number, number, number]>([0.01, 0.01, 0.01]);
  const finalScale = useRef<[number, number, number]>([0.015, 0.015, 0.015]);

  useFrame(() => {
    if (modelRef.current) {
      targetRotation.current.y = (mouse.x * Math.PI * 0.5) / 2;
      targetRotation.current.x = (-mouse.y * Math.PI * 0.5) / 2;

      modelRef.current.rotation.y = THREE.MathUtils.lerp(
        modelRef.current.rotation.y,
        targetRotation.current.y,
        0.05
      );
      modelRef.current.rotation.x = THREE.MathUtils.lerp(
        modelRef.current.rotation.x,
        targetRotation.current.x,
        0.05
      );

      const distanceFromCenter = Math.sqrt(
        mouse.x * mouse.x + mouse.y * mouse.y
      );
      const isMouseMoving = distanceFromCenter > 0.01;

      const baseTargetPosition = isMouseMoving
        ? movedPosition.current
        : initialPosition.current;

      const offsetX = mouse.x * 0.7;
      const offsetY = mouse.y * 0.7;

      const finalTargetPosition = [
        baseTargetPosition[0] + offsetX,
        baseTargetPosition[1] + offsetY,
        baseTargetPosition[2],
      ];

      modelRef.current.position.x = THREE.MathUtils.lerp(
        modelRef.current.position.x,
        finalTargetPosition[0],
        0.05
      );
      modelRef.current.position.y = THREE.MathUtils.lerp(
        modelRef.current.position.y,
        finalTargetPosition[1],
        0.05
      );
      modelRef.current.position.z = THREE.MathUtils.lerp(
        modelRef.current.position.z,
        finalTargetPosition[2],
        0.05
      );

      const targetScale = isMouseMoving
        ? finalScale.current
        : initialScale.current;

      modelRef.current.scale.x = THREE.MathUtils.lerp(
        modelRef.current.scale.x,
        targetScale[0],
        0.05
      );
      modelRef.current.scale.y = THREE.MathUtils.lerp(
        modelRef.current.scale.y,
        targetScale[1],
        0.05
      );
      modelRef.current.scale.z = THREE.MathUtils.lerp(
        modelRef.current.scale.z,
        targetScale[2],
        0.05
      );
    }
  });

  const { viewport } = useThree();

  return (
    <group scale={viewport.width / 10}>
      <ModelViewer
        ref={modelRef}
        src="/models/untitled.glb"
        typeModel="texture"
        scale={initialScale.current}
        position={initialPosition.current}
        rotation={[0.7, 1.55, 0]}
      />
    </group>
  );
};

function Home() {
  useLenis();

  const { scrollYProgress } = useScroll();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setMouse({ x, y });
  };

  const handleMouseLeave = () => {
    setMouse({ x: 0, y: 0 });
  };

  const rawX = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    [0, -300, 200, 0]
  );

  const xOffset = useSpring(rawX, {
    stiffness: 30,
    damping: 20,
    mass: 1,
  });

  return (
    <div
      className="h-[400vh] relative bg-[#101010]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="fixed w-screen h-screen z-30"
        style={{ x: xOffset, pointerEvents: "none" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <HeadScene mouse={mouse} />
      </motion.div>
      <div className="h-screen px-2 pt-2 overflow-clip relative">
        <GridFlip />
        <h1 className="text-white text-[420px] absolute tranfsform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-10">
          ONIN
        </h1>
      </div>
      <div className="h-screen px-2 pt-[2px] overflow-clip relative">
        <GridFlip />
      </div>
      <div className="h-screen flex justify-center items-center"></div>
      <div className="h-screen flex justify-center items-center"></div>
    </div>
  );
}

export default Home;
