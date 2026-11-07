import type { RiskClassification } from "../types/scan";

interface RiskMeterProps {
  score: number;
  classification: RiskClassification;
  size?: "sm" | "md" | "lg";
}

export default function RiskMeter({ score, classification, size = "md" }: RiskMeterProps) {
  const isUnableToVerify = score < 0 || classification === "UNABLE_TO_VERIFY";
  const displayScore = isUnableToVerify ? "—" : Math.max(0, Math.min(100, score));

  // Determine threat severity theme
  let strokeColor = "stroke-emerald-500";
  let textColor = "text-emerald-400";
  let label = "LOW RISK";
  let badgeClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let dotColor = "bg-emerald-400";

  if (isUnableToVerify) {
    strokeColor = "stroke-zinc-500";
    textColor = "text-zinc-400";
    label = "UNABLE TO VERIFY";
    badgeClasses = "bg-zinc-800 text-zinc-300 border-zinc-700";
    dotColor = "bg-zinc-400";
  } else if (score >= 75) {
    strokeColor = "stroke-rose-500";
    textColor = "text-rose-400";
    label = "CRITICAL THREAT";
    badgeClasses = "bg-rose-500/10 text-rose-400 border-rose-500/20";
    dotColor = "bg-rose-500";
  } else if (score >= 50) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-400";
    label = "HIGH SEVERITY";
    badgeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    dotColor = "bg-amber-500";
  } else if (score >= 25) {
    strokeColor = "stroke-yellow-500";
    textColor = "text-yellow-400";
    label = "MODERATE RISK";
    badgeClasses = "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    dotColor = "bg-yellow-400";
  }

  // Semi-circle gauge calculation
  const radius = 64;
  const strokeWidth = 10;
  const circumference = Math.PI * radius; // 180 deg half-circle
  const progress = isUnableToVerify ? 0 : Math.max(0, Math.min(100, score)) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  const dimensions =
    size === "sm"
      ? { width: 140, height: 80, fontSize: "text-2xl", labelSize: "text-[10px]" }
      : size === "lg"
      ? { width: 220, height: 125, fontSize: "text-4xl", labelSize: "text-xs" }
      : { width: 180, height: 105, fontSize: "text-3xl", labelSize: "text-[11px]" };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox="0 0 160 95"
          className="overflow-visible"
        >
          {/* Background Arc */}
          <path
            d="M 16 85 A 64 64 0 0 1 144 85"
            fill="none"
            stroke="currentColor"
            className="text-zinc-800/80"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Value Arc */}
          <path
            d="M 16 85 A 64 64 0 0 1 144 85"
            fill="none"
            className={`transition-all duration-1000 ease-out ${strokeColor}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Score Counter */}
        <div className="absolute bottom-1 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold tracking-tight ${dimensions.fontSize} ${textColor}`}>
            {displayScore}
          </span>
          <span className="font-mono text-[10px] tracking-wider text-zinc-500 uppercase">
            RISK INDEX
          </span>
        </div>
      </div>

      {/* Severity Status Badge */}
      <div className="mt-2.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide uppercase ${badgeClasses}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${score >= 75 ? "animate-ping" : ""}`} />
          {label}
        </span>
      </div>
    </div>
  );
}
