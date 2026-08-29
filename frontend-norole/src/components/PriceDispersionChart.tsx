interface RateData {
  cpseName: string;
  rate: number;
  annualQty: number;
}

interface PriceDispersionChartProps {
  rates: RateData[];
  targetRate: number;
  categoryTitle: string;
}

export function PriceDispersionChart({
  rates,
  targetRate,
  categoryTitle,
}: PriceDispersionChartProps) {
  const width = 500;
  const height = 210;
  const padding = 45;

  const minRate = Math.min(...rates.map((r) => r.rate), targetRate) * 0.85;
  const maxRate = Math.max(...rates.map((r) => r.rate)) * 1.15;

  const getY = (val: number) => {
    const range = maxRate - minRate;
    return height - padding - ((val - minRate) / range) * (height - 2 * padding);
  };

  const targetY = getY(targetRate);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Historical Purchase Price Dispersion Curve
        </span>
        <span className="text-xs font-mono font-medium text-slate-600 truncate max-w-[240px]">
          {categoryTitle}
        </span>
      </div>

      <div className="relative w-full flex justify-center my-1">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Y Axis Grid lines & values */}
          {[minRate, (minRate + maxRate) / 2, maxRate].map((val, i) => {
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - 20}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[8.5px] font-mono fill-slate-400 font-medium"
                >
                  ₹{val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Target Joint Rate Line */}
          <line
            x1={padding}
            y1={targetY}
            x2={width - 20}
            y2={targetY}
            stroke="#E11D48"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <text
            x={width - 25}
            y={targetY - 6}
            textAnchor="end"
            className="text-[9.5px] font-mono font-bold fill-rose-600"
          >
            TARGET RATE: ₹{targetRate.toLocaleString()}
          </text>

          {/* Scatter Points per CPSE */}
          {rates.map((item, idx) => {
            const step = (width - padding - 40) / (rates.length + 1);
            const x = padding + (idx + 1) * step;
            const y = getY(item.rate);

            return (
              <g key={idx} className="cursor-pointer group">
                {/* Vertical drop line */}
                <line
                  x1={x}
                  y1={height - padding}
                  x2={x}
                  y2={y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                {/* Point Circle */}
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="#0F172A"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />
                {/* Price text */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-slate-900"
                >
                  ₹{item.rate.toLocaleString()}
                </text>
                {/* CPSE Name on X Axis */}
                <text
                  x={x}
                  y={height - padding + 16}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-semibold fill-slate-700"
                >
                  {item.cpseName.split(' ')[0]}
                </text>
                <text
                  x={x}
                  y={height - padding + 27}
                  textAnchor="middle"
                  className="text-[8px] font-mono fill-slate-400"
                >
                  ({item.annualQty} qty)
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs font-mono text-slate-600">
        <span>
          Max Price Variance:{' '}
          <strong className="text-rose-600 font-bold">
            {(
              ((Math.max(...rates.map((r) => r.rate)) - Math.min(...rates.map((r) => r.rate))) /
                Math.min(...rates.map((r) => r.rate))) *
              100
            ).toFixed(1)}
            %
          </strong>
        </span>
        <span>
          Joint Tender Volume:{' '}
          <strong className="text-slate-900 font-bold">
            {rates.reduce((a, b) => a + b.annualQty, 0).toLocaleString()} Units
          </strong>
        </span>
      </div>
    </div>
  );
}
