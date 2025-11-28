import { ShapeType } from '../types';
import * as THREE from 'three';

// Helper to get random point on sphere surface
const randomSpherePoint = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export const generateParticles = (shape: ShapeType, count: number): Float32Array => {
  const positions = new Float32Array(count * 3);
  const vec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    switch (shape) {
      case ShapeType.HEART: {
        // Parametric Heart
        const t = Math.random() * Math.PI * 2;
        const u = Math.random() * Math.PI; // distribution fix needed for evenness, but random is okay for particles
        // 3D Heart approximation
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const z = (Math.random() - 0.5) * 5; // Thickness
        
        // Scale down
        vec.set(x, y, z).multiplyScalar(0.15);
        break;
      }

      case ShapeType.FLOWER: {
        // Rose curve / Phyllotaxis 3D
        const r = 3 * Math.sqrt(Math.random());
        const theta = i * 2.39996; // Golden angle approx
        const y = (Math.random() - 0.5) * 2;
        
        vec.set(
          r * Math.cos(theta),
          y + Math.sin(r * 2) * 1.5, // Wavy petals
          r * Math.sin(theta)
        ).multiplyScalar(0.8);
        break;
      }

      case ShapeType.SATURN: {
        const isRing = Math.random() > 0.3; // 70% ring, 30% planet
        if (!isRing) {
          // Planet
          const p = randomSpherePoint(1.5);
          vec.copy(p);
        } else {
          // Ring
          const angle = Math.random() * Math.PI * 2;
          const dist = 2.2 + Math.random() * 1.5;
          vec.set(
            Math.cos(angle) * dist,
            (Math.random() - 0.5) * 0.1, // Thin disk
            Math.sin(angle) * dist
          );
          // Tilt the ring
          vec.applyAxisAngle(new THREE.Vector3(1, 0, 0), 0.4);
          vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.2);
        }
        break;
      }

      case ShapeType.MEDITATE: {
        // Approximate a seated figure with stacked primitives
        const r = Math.random();
        
        if (r < 0.25) {
          // Head
          const p = randomSpherePoint(0.6);
          p.y += 1.8;
          vec.copy(p);
        } else if (r < 0.6) {
          // Body (Capsule-ish)
          const theta = Math.random() * Math.PI * 2;
          const h = Math.random() * 2; // Height 0 to 2
          const rad = 0.8 + Math.sin(h * Math.PI) * 0.2; // Taper
          vec.set(
            rad * Math.cos(theta),
            h - 0.5,
            rad * Math.sin(theta)
          );
        } else {
           // Legs / Base (Flattened sphere/disk)
           const angle = Math.random() * Math.PI * 2;
           const dist = Math.random() * 1.8;
           const height = (Math.random() - 0.5) * 0.8;
           vec.set(
             Math.cos(angle) * dist,
             height - 0.8,
             Math.sin(angle) * dist
           );
        }
        break;
      }

      case ShapeType.FIREWORKS: {
        // Explosion sphere
        const p = randomSpherePoint(0.2 + Math.random() * 3.5);
        vec.copy(p);
        break;
      }

      default:
        vec.set(0, 0, 0);
    }

    positions[i3] = vec.x;
    positions[i3 + 1] = vec.y;
    positions[i3 + 2] = vec.z;
  }

  return positions;
};