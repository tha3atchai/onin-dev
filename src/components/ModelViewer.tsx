import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  OrbitControls,
  Text,
  useGLTF,
} from "@react-three/drei";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Leva, useControls } from "leva";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";
interface MaterialsProps {
  thickness?: number;
  roughness?: number;
  transmission?: number;
  ior?: number;
  chromaticAberration?: number;
  backside?: boolean;
  opacity?: number;
}
interface ModelViewerProps {
  src: string;
  text?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  typeModel?: "texture" | "primitive" | "group";
  materialsProps?: MaterialsProps;
}

const Model = ({
  src,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  typeModel,
  materialsProps,
}: ModelViewerProps) => {
  const { scene, animations } = useGLTF(src);

  const sceneClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  const mixer = useMemo(() => {
    const mixer = new THREE.AnimationMixer(sceneClone);
    animations.forEach((clip: THREE.AnimationClip) => {
      mixer.clipAction(clip).play();
    });
    return mixer;
  }, [animations, sceneClone]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  // const materialProps =
  //   materialsProps ??
  //   useControls({
  //     thickness: { value: 2.45, min: 0, max: 3, step: 0.05 },
  //     roughness: { value: 0.2, min: 0, max: 1, step: 0.1 },
  //     transmission: { value: 0.9, min: 0, max: 1, step: 0.1 },
  //     ior: { value: 0.4, min: 0, max: 3, step: 0.1 },
  //     chromaticAberration: { value: 0.96, min: 0, max: 1 },
  //     backside: { value: true },
  //     opacity: { value: 0.75, min: 0, max: 1, step: 0.05 },
  //   });

  const materialProps = {
    thickness: 2.45,
    roughness: 0.2,
    transmission: 0.9,
    ior: 0.4,
    chromaticAberration: 0.96,
    backside: true,
    opacity: 0.75,
  };

  useEffect(() => {
    if (typeModel === "texture") {
      return;
    }
    if (scene) {
      scene.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const material = mesh.material;

          if (material instanceof THREE.MeshStandardMaterial) {
            material.roughness = 0.7;
            material.metalness = 0.2;
          }
        }
      });
    }
  }, [scene, typeModel]);

  return (
    <>
      {typeModel === "texture" && (
        <group ref={groupRef} scale={scale} position={position}>
          {/* <Leva hidden={false} /> */}
          {scene.children.map((child, index) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.center();
              return (
                <mesh
                  key={index}
                  geometry={child.geometry}
                  rotation={[0, 0.9, 1.2]}
                >
                  <MeshTransmissionMaterial
                    {...materialProps}
                    transparent={true}
                  />
                </mesh>
              );
            }
            return null;
          })}
        </group>
      )}
      {typeModel === "group" && (
        <group ref={groupRef} position={position} scale={scale} dispose={null}>
          <primitive object={sceneClone} />
        </group>
      )}
      {typeModel === "primitive" && (
        <primitive
          ref={groupRef}
          object={sceneClone}
          position={position}
          scale={scale}
        />
      )}
    </>
  );
};

const ModelText = ({
  text,
  positionText,
}: {
  text: string;
  positionText: [number, number, number];
}) => (
  <>
    <Text
      position={positionText}
      fontSize={4}
      color="black"
      anchorX="center"
      anchorY="middle"
      lineHeight={1}
    >
      {text}
    </Text>
  </>
);

const ModelViewer = React.memo(
  ({ src, position, scale, typeModel, text = "" }: ModelViewerProps) => {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Canvas style={{ width: "100%", height: "100%" }}>
          {/* <OrbitControls /> */}
          <ambientLight intensity={1.5} color="white" />
          <directionalLight position={[5, 5, 5]} intensity={2} color="white" />
          <Model
            src={src}
            position={position}
            scale={scale}
            typeModel={typeModel}
          />
          <Environment preset="city" />
          <ModelText text={text} positionText={[0, 0, 0]} />
        </Canvas>
      </Suspense>
    );
  }
);

export default ModelViewer;
