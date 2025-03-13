import { useFrame } from "@react-three/fiber";
import { Html, MeshTransmissionMaterial, useGLTF } from "@react-three/drei";
import React, {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";
import { useControls } from "leva";
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
  scale?: [number, number, number] | number;
  typeModel?: "texture" | "primitive" | "group";
  materialsProps?: MaterialsProps;
  rotation?: [number, number, number];
}

const Model = forwardRef<THREE.Group, ModelViewerProps>(
  ({ src, position, scale, typeModel, rotation }: ModelViewerProps, ref) => {
    const { scene, animations } = useGLTF(src);

    const sceneClone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const groupRef = useRef<THREE.Group>(null);

    useImperativeHandle(ref, () => groupRef.current as THREE.Group);

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

    const materialProps = useControls({
      thickness: { value: 0, min: 0, max: 3, step: 0.05 },
      roughness: { value: 0.3, min: 0, max: 1, step: 0.1 },
      transmission: { value: 0.2, min: 0, max: 1, step: 0.1 },
      ior: { value: 0.3, min: 0, max: 3, step: 0.1 },
      chromaticAberration: { value: 1, min: 0, max: 1 },
      backside: { value: true },
    });

    // const materialProps = {
    //   thickness: 2.45,
    //   roughness: 0.2,
    //   transmission: 0.9,
    //   ior: 0.4,
    //   chromaticAberration: 0.96,
    //   backside: true,
    //   opacity: 0.75,
    // };

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
            {scene.children.map((child, index) => {
              if (child instanceof THREE.Mesh) {
                child.geometry.center();
                return (
                  <mesh
                    key={index}
                    geometry={child.geometry}
                    rotation={rotation}
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
          <group
            ref={groupRef}
            position={position}
            scale={scale}
            dispose={null}
            rotation={rotation}
          >
            <primitive object={sceneClone} />
          </group>
        )}
        {typeModel === "primitive" && (
          <primitive
            ref={groupRef}
            object={sceneClone}
            position={position}
            scale={scale}
            rotation={rotation}
          />
        )}
      </>
    );
  }
);

Model.displayName = "Model";

const ModelViewer = React.memo(
  forwardRef<THREE.Group, ModelViewerProps>(
    ({ src, position, scale, typeModel, rotation }: ModelViewerProps, ref) => {
      return (
        <>
          <Suspense fallback={<Html>Loading...</Html>}>
            <Model
              ref={ref}
              src={src}
              position={position}
              scale={scale}
              typeModel={typeModel}
              rotation={rotation}
            />
          </Suspense>
        </>
      );
    }
  )
);

ModelViewer.displayName = "ModelViewer";

export default ModelViewer;
