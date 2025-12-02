import React from 'react';
import { ParticleConfig, ShapeType } from '../types';
import { Palette, Maximize, Minimize, Hand, Sliders } from 'lucide-react';

interface ControlsProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  isTracking: boolean;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig, isTracking }) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const shapes = Object.values(ShapeType);
  const colors = ['#ffffff', '#ff0055', '#00ccff', '#ffaa00', '#aa00ff', '#00ff66'];

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            ZenParticles
          </h1>
          <p className="text-xs text-gray-400 mt-1">Interactive 3D System</p>
        </div>

        <button 
          onClick={toggleFullscreen}
          className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg transition-colors text-white"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      {/* Tracking Indicator */}
      <div className={`absolute top-6 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${isTracking ? 'opacity-100' : 'opacity-30'}`}>
         <div className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
            <Hand size={16} className={isTracking ? "text-green-400" : "text-red-400"} />
            <span className="text-xs font-mono text-gray-300">
              {isTracking ? "HAND DETECTED" : "NO HANDS DETECTED"}
            </span>
         </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-4 pointer-events-auto max-w-md">
        
        {/* Shape Selector */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
          <label className="text-xs text-gray-400 uppercase font-semibold mb-3 block">Model Shape</label>
          <div className="flex flex-wrap gap-2">
            {shapes.map((shape) => (
              <button
                key={shape}
                onClick={() => setConfig({ ...config, shape })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  config.shape === shape
                    ? 'bg-white text-black shadow-lg shadow-white/20'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
              >
                {shape}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamics Controls */}
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl">
           <div className="flex items-center gap-2 mb-3 text-xs text-gray-400 uppercase font-semibold">
              <Sliders size={14} />
              <span>Dynamics</span>
           </div>
           
           <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                   <span>MORPH SPEED</span>
                   <span>{config.morphSpeed.toFixed(1)}</span>
                </div>
                <input 
                    type="range" min="0.5" max="10.0" step="0.5"
                    value={config.morphSpeed}
                    onChange={(e) => setConfig({...config, morphSpeed: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                   <span>INTERACTION INTENSITY</span>
                   <span>{config.morphIntensity.toFixed(1)}</span>
                </div>
                <input 
                    type="range" min="0.5" max="8.0" step="0.5"
                    value={config.morphIntensity}
                    onChange={(e) => setConfig({...config, morphIntensity: parseFloat(e.target.value)})}
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
           </div>
        </div>

        {/* Color & Size */}
        <div className="flex gap-4">
          <div className="flex-1 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4">
             <Palette size={18} className="text-gray-400" />
             <div className="flex gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => setConfig({...config, color: c})}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${config.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
             </div>
             <input 
               type="color" 
               value={config.color}
               onChange={(e) => setConfig({...config, color: e.target.value})}
               className="w-8 h-8 rounded-full overflow-hidden border-0 p-0 bg-transparent cursor-pointer"
             />
          </div>
        </div>
        
        <div className="text-[10px] text-gray-500 px-1">
          Instruction: Use two hands to expand/contract. Pinch with one hand if using single hand.
        </div>

      </div>
    </div>
  );
};

export default Controls;