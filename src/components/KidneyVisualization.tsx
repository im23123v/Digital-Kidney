import { motion } from "framer-motion";

interface KidneyVisualizationProps {
  efficiency: number;
  stressIndex: number;
  animated?: boolean;
}

export default function KidneyVisualization({ efficiency, stressIndex, animated = true }: KidneyVisualizationProps) {
  const getColor = () => {
    if (efficiency >= 75) return { main: "hsl(152, 60%, 42%)", glow: "hsl(152, 60%, 42%)" };
    if (efficiency >= 50) return { main: "hsl(38, 92%, 50%)", glow: "hsl(38, 92%, 50%)" };
    return { main: "hsl(0, 72%, 55%)", glow: "hsl(0, 72%, 55%)" };
  };

  const color = getColor();

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className="absolute rounded-full opacity-20 blur-2xl"
        style={{
          width: 200,
          height: 200,
          backgroundColor: color.glow,
        }}
        animate={animated ? { scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.svg
        width="200"
        height="240"
        viewBox="0 0 200 240"
        fill="none"
        animate={animated ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Left Kidney */}
        <motion.path
          d="M55 50 C25 60, 15 100, 20 130 C25 165, 45 190, 65 195 C80 198, 85 180, 80 160 C75 140, 78 110, 85 90 C90 75, 80 45, 55 50Z"
          fill={color.main}
          fillOpacity={0.15 + efficiency * 0.005}
          stroke={color.main}
          strokeWidth="2"
        />
        {/* Left kidney inner detail */}
        <path
          d="M55 70 C42 78, 35 100, 38 125 C40 145, 52 170, 63 175"
          fill="none"
          stroke={color.main}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />
        
        {/* Right Kidney */}
        <motion.path
          d="M145 50 C175 60, 185 100, 180 130 C175 165, 155 190, 135 195 C120 198, 115 180, 120 160 C125 140, 122 110, 115 90 C110 75, 120 45, 145 50Z"
          fill={color.main}
          fillOpacity={0.15 + efficiency * 0.005}
          stroke={color.main}
          strokeWidth="2"
        />
        {/* Right kidney inner detail */}
        <path
          d="M145 70 C158 78, 165 100, 162 125 C160 145, 148 170, 137 175"
          fill="none"
          stroke={color.main}
          strokeWidth="1"
          strokeOpacity="0.4"
          strokeDasharray="4 3"
        />

        {/* Ureter connections */}
        <path d="M68 192 C75 210, 85 220, 95 225" stroke={color.main} strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
        <path d="M132 192 C125 210, 115 220, 105 225" stroke={color.main} strokeWidth="1.5" strokeOpacity="0.5" fill="none"/>
        
        {/* Bladder */}
        <ellipse cx="100" cy="232" rx="12" ry="8" fill={color.main} fillOpacity="0.1" stroke={color.main} strokeWidth="1" strokeOpacity="0.3"/>

        {/* Aorta */}
        <line x1="100" y1="30" x2="100" y2="50" stroke={color.main} strokeWidth="2" strokeOpacity="0.3"/>
        <line x1="100" y1="50" x2="78" y2="60" stroke={color.main} strokeWidth="1.5" strokeOpacity="0.3"/>
        <line x1="100" y1="50" x2="122" y2="60" stroke={color.main} strokeWidth="1.5" strokeOpacity="0.3"/>

        {/* Animated flow particles */}
        {animated && (
          <>
            <motion.circle
              r="2"
              fill={color.main}
              animate={{ 
                cx: [100, 85, 65, 55],
                cy: [35, 55, 80, 120],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              r="2"
              fill={color.main}
              animate={{ 
                cx: [100, 115, 135, 145],
                cy: [35, 55, 80, 120],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1.5 }}
            />
          </>
        )}
      </motion.svg>

      {/* Center efficiency display */}
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold font-mono" style={{ color: color.main }}>
          {efficiency}%
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">Efficiency</span>
      </div>
    </div>
  );
}
