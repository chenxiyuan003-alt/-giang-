import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

interface HandVisionProps {
  onHandUpdate: (distance: number, isTracking: boolean) => void;
}

const HandVision: React.FC<HandVisionProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const lastVideoTime = useRef(-1);
  const requestRef = useRef<number>(0);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setLoaded(true);
      } catch (e) {
        console.error("Failed to load MediaPipe", e);
      }
    };
    init();

    return () => {
      if (handLandmarkerRef.current) handLandmarkerRef.current.close();
    };
  }, []);

  useEffect(() => {
    if (!loaded || !videoRef.current) return;

    const enableCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };

    enableCam();

    return () => {
      // Cleanup stream
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const predictWebcam = () => {
    if (!handLandmarkerRef.current || !videoRef.current) return;

    const startTimeMs = performance.now();
    if (videoRef.current.currentTime !== lastVideoTime.current) {
      lastVideoTime.current = videoRef.current.currentTime;
      const results = handLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      let factor = 0;
      let isTracking = false;

      if (results.landmarks && results.landmarks.length > 0) {
        isTracking = true;
        
        if (results.landmarks.length === 2) {
          // Two hands: Calculate distance between wrists (index 0) or Index fingers (index 8)
          const hand1 = results.landmarks[0][0]; // Wrist
          const hand2 = results.landmarks[1][0]; // Wrist
          
          // Simple euclidean distance in screen space (normalized 0-1)
          const dx = hand1.x - hand2.x;
          const dy = hand1.y - hand2.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Map distance 0.2->0.8 to factor 0->1
          factor = Math.max(0, Math.min(1, (dist - 0.1) * 2));

        } else if (results.landmarks.length === 1) {
            // One hand: Pinch detection (Thumb tip 4 and Index tip 8)
            const hand = results.landmarks[0];
            const thumb = hand[4];
            const index = hand[8];

            const dx = thumb.x - index.x;
            const dy = thumb.y - index.y;
            const dz = thumb.z - index.z; // Optional depth
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

            // Map pinch distance (approx 0.02 closed to 0.2 open)
            factor = Math.max(0, Math.min(1, dist * 5));
        }
      }

      onHandUpdate(factor, isTracking);
    }
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  return (
    <div className="fixed bottom-4 right-4 w-32 h-24 rounded-lg overflow-hidden border-2 border-white/20 bg-black z-50 shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover transform -scale-x-100 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
          Loading AI...
        </div>
      )}
    </div>
  );
};

export default HandVision;