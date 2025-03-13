"use client";
import React, { useEffect, useRef } from "react";

import dynamic from "next/dynamic";
const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
});

function page() {
  return (
    <div className="h-[400vh] relative">
      <div className="h-[100vh] bg-red-300 absolute w-full hover:bg-amber-500">
        <div className="w-[300px] h-[300px] absolute  transform top-1/2 -left-[120px] z-10 -translate-y-1/2 ">
          <ModelViewer
            src={"/models/untitled.glb"}
            typeModel="texture"
            scale={[0.02, 0.02, 0.02]}
            position={[1, 0.2, -0.1]}
            text="ONIN"
          />
        </div>
        <button className="text-red-700 top-1/2 absolute bg-amber-300 p-4 rounded-full hover:bg-blue-400">
          ONIN
        </button>
      </div>
    </div>
  );
}

export default page;
