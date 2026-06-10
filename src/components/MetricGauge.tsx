import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricResult } from "@/data/analysisData";

const STATUS_CONFIG = {
  normal: { color: "#00ff88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.25)", label: "正常" },
  warning: { color: "#ffaa00", bg: "rgba(255,170,0,0.08)", border: "rgba(255,170,0,0.25)", label: "注意" },
  danger: { color: "#ff3366", bg: "rgba(255,51,102,0.08)", border: "rgba(255,51,102,0.25)", label: "严重" },
};

function CircularGauge({ value, maxValue, color, size = 80 }: { value: number; maxValue: number; color: string; size?: number }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(value / maxValue, 1);
  const dashOffset = circumference * (1 - ratio);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
    </svg>
  );
}

export default function MetricGauge({ metric }: { metric: MetricResult }) {
  const config = STATUS_CONFIG[metric.status];
  const [refLow, refHigh] = metric.referenceRange;
  const inRange = metric.value >= refLow && metric.value <= refHigh;
  const maxValue = refHigh * 2;

  return (
    <div
      className="relative rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
      style={{ backgroundColor: config.bg, borderColor: config.border, borderWidth: 1 }}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <CircularGauge value={metric.value} maxValue={maxValue} color={config.color} size={72} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-display" style={{ color: config.color }}>
              {metric.value}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-200 text-xs font-body truncate">{metric.name}</span>
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-display tracking-wider flex-shrink-0"
              style={{ color: config.color, backgroundColor: `${config.color}15` }}
            >
              {config.label}
            </span>
          </div>
          <div className="text-gray-500 text-[10px] font-mono mb-1.5">
            参考: {refLow}–{refHigh}{metric.unit}
          </div>
          <div className="flex items-center gap-1">
            {inRange ? (
              <Minus className="w-3 h-3" style={{ color: "#00ff88" }} />
            ) : metric.value > refHigh ? (
              <TrendingUp className="w-3 h-3" style={{ color: config.color }} />
            ) : (
              <TrendingDown className="w-3 h-3" style={{ color: config.color }} />
            )}
            <span className="text-[10px] font-body" style={{ color: config.color }}>
              {metric.value}{metric.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
