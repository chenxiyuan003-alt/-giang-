import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleConfig, ShapeType } from '../types';
import { generateParticles } from '../utils/geometry';

interface SceneProps {
  config: ParticleConfig;
  handFactor: React.MutableRefObject<number>;
}

const Scene: React.FC<SceneProps> = ({ config, handFactor }) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Store geometries for all shapes to avoid re-calculation during morph
  // We use a high count to support all shapes, handling unused points by hiding them or collapsing them
  const maxParticles = config.count;
  
  const shapesData = useMemo(() => {
    const shapes: Record<string, Float32Array> = {};
    Object.values(ShapeType).forEach(type => {
      shapes[type] = generateParticles(type as ShapeType, maxParticles);
    });
    return shapes;
  }, [maxParticles]);

  // Current position buffer
  const positions = useMemo(() => {
    return new Float32Array(maxParticles * 3);
  }, [maxParticles]);

  // Initialize positions to start shape
  useEffect(() => {
    const startData = shapesData[config.shape];
    if (startData) {
      positions.set(startData);
      if (pointsRef.current) {
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
      }
    }
  }, [positions, shapesData, config.shape]);


  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const targetPositions = shapesData[config.shape];
    const currentPositions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    
    // Hand Interaction Factor (Smoothed)
    // If handFactor is 0 (closed/close hands), particles are compact.
    // If handFactor is 1 (open/far hands), particles explode/scale.
    const hFactor = handFactor.current;
    
    // Lerp Speed (Morphing smoothness)
    const speed = 4.0 * delta; 
    
    // Time for idle animation
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < maxParticles; i++) {
      const i3 = i * 3;
      
      // Target coordinates
      let tx = targetPositions[i3];
      let ty = targetPositions[i3 + 1];
      let tz = targetPositions[i3 + 2];

      // 1. Morph: Move current towards target
      // We do this by calculating the vector from current to target
      // Note: We need to store the "base" morph position separately from the "displayed" position
      // which includes the hand modifier. However, for simplicity/performance in this specific effect, 
      // we can lerp the *base* shape and then apply the modifier.
      // To do this properly without an extra buffer, we can just lerp towards the target directly,
      // but that makes the expansion persistent. 
      // Better approach: Calculate the "Base" position by lerping a persistent state?
      // Optimization: Just lerp the visual position towards (Target * Expansion).
      
      // Let's add some "Life" (Noise/Idle movement)
      const noise = Math.sin(time * 0.5 + i * 0.1) * 0.05;
      
      // Calculate expansion multiplier
      // Base scale is 1. When hand is open (1), scale up to 2.5
      const expansion = 1 + (hFactor * 2.5);
      
      // Explosion effect for fireworks
      let animX = tx;
      let animY = ty;
      let animZ = tz;

      if (config.shape === ShapeType.FIREWORKS) {
          // Fireworks rotate and pulse
          const pulse = 1 + Math.sin(time * 2) * 0.2;
          animX *= pulse;
          animY *= pulse;
          animZ *= pulse;
      } else if (config.shape === ShapeType.SATURN) {
          // Rotate Saturn slowly
          const cos = Math.cos(time * 0.2);
          const sin = Math.sin(time * 0.2);
          const rx = animX * cos - animZ * sin;
          const rz = animX * sin + animZ * cos;
          animX = rx;
          animZ = rz;
      }

      // Apply expansion
      const finalTx = animX * expansion;
      const finalTy = animY * expansion;
      const finalTz = animZ * expansion;

      // Linear Interpolation (Lerp)
      currentPositions[i3] += (finalTx - currentPositions[i3]) * speed;
      currentPositions[i3+1] += (finalTy - currentPositions[i3+1]) * speed;
      currentPositions[i3+2] += (finalTz - currentPositions[i3+2]) * speed;
      
      // Add subtle drift based on hand factor (more chaotic when expanded)
      if (hFactor > 0.1) {
         currentPositions[i3] += (Math.random() - 0.5) * hFactor * 0.05;
         currentPositions[i3+1] += (Math.random() - 0.5) * hFactor * 0.05;
         currentPositions[i3+2] += (Math.random() - 0.5) * hFactor * 0.05;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate entire system slowly based on mouse or time
    pointsRef.current.rotation.y += delta * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={maxParticles}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.particleSize}
        color={config.color}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export default Scene;