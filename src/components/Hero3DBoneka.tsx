"use client";
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

import { useState } from 'react';

function BonekaModel() {
  const { scene } = useGLTF('/models/tes-boneka.glb');
  return <primitive object={scene} />;
}

export default function Hero3DBoneka() {
  const [hitbox, setHitbox] = useState<HTMLDivElement | null>(null);

  return (
    <div className="w-[82%] h-[82%] relative z-10 animate-float drop-shadow-[0_25px_35px_rgba(255,143,177,0.25)] flex items-center justify-center pointer-events-none">
      
      {/* Invisible Hitbox exactly the size of the model */}
      <div 
        ref={setHitbox} 
        className="absolute w-[50%] h-[85%] z-20 pointer-events-auto cursor-grab active:cursor-grabbing rounded-[2rem]" 
      />

      <Canvas 
        shadows 
        dpr={[1, 2]} 
        camera={{ position: [0, 0, 4], fov: 50 }} 
        gl={{ alpha: true }}
        style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.6} adjustCamera={1.2}>
            <BonekaModel />
          </Stage>
        </Suspense>
        {hitbox && (
          <OrbitControls 
            domElement={hitbox} 
            autoRotate 
            enableZoom={false} 
            makeDefault 
          />
        )}
      </Canvas>
    </div>
  );
}

// Preload to ensure smooth rendering
useGLTF.preload('/models/tes-boneka.glb');
