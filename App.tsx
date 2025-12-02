import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Scene from './components/Scene';
import Controls from './components/Controls';
import HandVision from './components/HandVision';
import { ParticleConfig, ShapeType } from './types';

const App: React.FC = () => {
  const [config, setConfig] = useState<ParticleConfig>({
    count: 6000,
    color: '#00ccff',
    shape: ShapeType.HEART,
    particleSize: 0.035,
    morphSpeed: 4.0,
    morphIntensity: 2.5,
  });

  const [isTracking, setIsTracking] = useState(false);
  
  // Shared ref for performance (avoids React re-renders on every frame for hand data)
  const handFactor = useRef(0);

  const handleHandUpdate = useCallback((factor: number, tracking: boolean) => {
    // Smooth dampening could be added here, but we'll do it in visual loop or keep raw for responsiveness
    // Simple low-pass filter
    handFactor.current += (factor - handFactor.current) * 0.1;
    setIsTracking(tracking);
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={['#050505']} />
        
        {/* Environment */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        {/* Interactive Particles */}
        <Scene config={config} handFactor={handFactor} />
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={true} 
          minDistance={2} 
          maxDistance={10} 
          autoRotate={!isTracking} // Stop rotation when interacting
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Overlay */}
      <Controls config={config} setConfig={setConfig} isTracking={isTracking} />

      {/* Computer Vision Logic */}
      <HandVision onHandUpdate={handleHandUpdate} />
    </div>
  );
};

export default App;