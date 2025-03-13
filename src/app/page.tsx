"use client";
import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="relative h-[100vh]">
      <ModelViewer
        text="ONIN"
        typeModel="texture"
        scale={[0.02, 0.02, 0.02]}
        position={[1, 0.2, -0.1]}
        src="/models/untitled.glb"
      />
      <div className="text-[400px] absolute top-0 -z-10">ONIN</div>
    </div>
  );
}
