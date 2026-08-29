import { useMemo } from 'react';

interface RadarProps {
  dimensions: number;      // 0 to 100
  materialGrade: number;   // 0 to 100
  pressureClass: number;   // 0 to 100
  standardCode: number;    // 0 to 100
  uomConsistency: number;  // 0 to 100
}

export function FactorRadarChart({
  dimensions,
  materialGrade,
  pressureClass,
  standardCode,
  uomConsistency,
}: RadarProps) {
  const size = 260;
  const center = size / 2;
  const radius = 90;

  const axes = [
    { label: 'PRESSURE CLASS', value: pressureClass, angle: -90 },
    { label: 'DIMENSIONS', value: dimensions, angle: -18 },
    { label: 'MATERIAL GRADE', value: materialGrade, angle: 54 },
    { label: 'STANDARD SPEC', value: standardCode, angle: 126 },
    { label: 'UoM CONFORMANCE', value: uomConsistency, angle: 198 },
  ];

  const getCoordinates = (value: number, angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);
    return { x, y };
  };

  const polygonPoints = useMemo(() => {
    return axes
      .map((axis) => {
        const { x, y } = getCoordinates(axis.value, axis.angle);
        return `${x},${y}`;
      })
      .join(' ');
  }, [dimensions, materialGrade, pressureClass, standardCode, uomConsistency]);

  const avgConformance = useMemo(() => {
    return ((dimensions + materialGrade + pressureClass + standardCode + uomConsistency) / 5).toFixed(1);
  }, [dimensions, materialGrade, pressureClass, standardCode, uomConsistency]);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          5-Axis Topology Radar
        </span>
        <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
          TOLERANCE ±0.5%
        </span>
      </div>

      <svg width={size} height={size} className="overflow-visible my-1">
        {/* Background Concentric Grid Rings */}
        {[25, 50, 75, 100].map((ring) => (
          <circle
            key={ring}
            cx={center}
            cy={center}
            r={(ring / 100) * radius}
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray={ring === 100 ? 'none' : '3,3'}
            opacity={ring === 100 ? 0.8 : 0.5}
          />
        ))}

        {/* Axis Spokes */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(100, axis.angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Data Polygon */}
        <polygon
          points={polygonPoints}
          fill="#F43F5E"
          fillOpacity="0.18"
          stroke="#E11D48"
          strokeWidth="2"
        />

        {/* Data Vertices */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(axis.value, axis.angle);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#E11D48"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const { x, y } = getCoordinates(124, axis.angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] font-mono font-medium fill-slate-600"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      <div className="mt-3 text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg py-1.5 px-3 w-full flex justify-between items-center">
        <span className="text-slate-500">Overall Match:</span>
        <span className="font-bold text-rose-600">{avgConformance}% Conformance</span>
      </div>
    </div>
  );
}
