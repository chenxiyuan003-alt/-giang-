import type { ThreeElements } from '@react-three/fiber';

export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  MEDITATE = 'Buddha', // Approximation
  FIREWORKS = 'Fireworks'
}

export interface ParticleConfig {
  count: number;
  color: string;
  shape: ShapeType;
  particleSize: number;
}

export interface HandData {
  distance: number; // 0 to 1 normalized
  isTracking: boolean;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}